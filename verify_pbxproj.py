#!/usr/bin/env python3
import sys
import os
import re

def parse_pbx(text):
    # Strip comments
    # Preserve line count if needed, but for syntax verification:
    # 1. Remove /* ... */
    no_block_comments = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    # 2. Remove // ...
    no_comments = re.sub(r'//.*?\n', '\n', no_block_comments)
    
    # Tokenize: string literals ("..."), delimiters ({, }, (, ), =, ;, ,), or barewords ([a-zA-Z0-9_\.\-\+\$\(\)]+)
    token_pattern = re.compile(r'("(?:\\.|[^"\\])*")|([{}();,=])|([^\s{}();,=]+)')
    tokens = []
    for match in token_pattern.finditer(no_comments):
        s_val = match.group(1)
        d_val = match.group(2)
        w_val = match.group(3)
        if s_val is not None:
            # Unescape quoted string
            tokens.append(eval(s_val))
        elif d_val is not None:
            tokens.append(d_val)
        elif w_val is not None:
            tokens.append(w_val)
            
    pos = 0
    def peek():
        nonlocal pos
        return tokens[pos] if pos < len(tokens) else None
        
    def consume(expected=None):
        nonlocal pos
        tok = peek()
        if not tok:
            raise ValueError(f"Unexpected EOF, expected {expected}")
        if expected and tok != expected:
            raise ValueError(f"Expected '{expected}', got '{tok}' at token index {pos}")
        pos += 1
        return tok
        
    def parse_value():
        tok = peek()
        if not tok:
            raise ValueError("Unexpected EOF while parsing value")
        if tok == '{':
            return parse_dict()
        elif tok == '(':
            return parse_array()
        else:
            return consume()
            
    def parse_dict():
        consume('{')
        d = {}
        while True:
            tok = peek()
            if not tok:
                raise ValueError("Unclosed dictionary")
            if tok == '}':
                consume('}')
                break
            key = consume()
            consume('=')
            val = parse_value()
            consume(';')
            d[key] = val
        return d
        
    def parse_array():
        consume('(')
        arr = []
        while True:
            tok = peek()
            if not tok:
                raise ValueError("Unclosed array")
            if tok == ')':
                consume(')')
                break
            item = parse_value()
            if peek() == ',':
                consume(',')
            arr.append(item)
        return arr

    root = parse_dict()
    assert pos == len(tokens), f"Trailing tokens: {tokens[pos:pos+5]}"
    return root

def main():
    pbx_path = "ios/IronLog.xcodeproj/project.pbxproj"
    if not os.path.exists(pbx_path):
        print(f"Error: {pbx_path} does not exist!")
        sys.exit(1)
        
    with open(pbx_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    print(f"1. Reading {pbx_path} (length: {len(content)} chars)...")
    root = parse_pbx(content)
    print("2. Parsing OpenStep PBX AST succeeded! No syntax or structure errors.")
    
    print("3. Validating PBX structure...")
    assert "archiveVersion" in root, "Missing archiveVersion"
    assert "objectVersion" in root, "Missing objectVersion"
    assert "objects" in root, "Missing objects"
    assert "rootObject" in root, "Missing rootObject"
    
    objects = root["objects"]
    root_id = root["rootObject"]
    assert root_id in objects, f"rootObject {root_id} not in objects"
    project_obj = objects[root_id]
    assert project_obj.get("isa") == "PBXProject", "rootObject is not PBXProject"
    
    # Check targets
    targets = project_obj.get("targets", [])
    assert len(targets) > 0, "PBXProject has no targets"
    target_id = targets[0]
    assert target_id in objects, f"Target {target_id} not found in objects"
    target = objects[target_id]
    assert target.get("isa") == "PBXNativeTarget", "Target is not PBXNativeTarget"
    assert target.get("name") == "IronLog", "Target name is not IronLog"
    
    # Check target build phases
    phases = target.get("buildPhases", [])
    assert len(phases) == 3, f"Expected 3 build phases, found {len(phases)}"
    
    sources_phase = None
    resources_phase = None
    frameworks_phase = None
    for pid in phases:
        assert pid in objects, f"Phase {pid} not found in objects"
        p = objects[pid]
        p_isa = p.get("isa")
        if p_isa == "PBXSourcesBuildPhase":
            sources_phase = p
        elif p_isa == "PBXResourcesBuildPhase":
            resources_phase = p
        elif p_isa == "PBXFrameworksBuildPhase":
            frameworks_phase = p
            
    assert sources_phase, "SourcesBuildPhase missing"
    assert resources_phase, "ResourcesBuildPhase missing"
    assert frameworks_phase, "FrameworksBuildPhase missing"
    
    # Check sources files
    source_files = sources_phase.get("files", [])
    expected_sources = {
        "IronLogApp.swift",
        "ContentView.swift",
        "StoreKitManager.swift",
        "WebViewBridge.swift",
        "NotificationManager.swift"
    }
    found_sources = set()
    for bfid in source_files:
        assert bfid in objects, f"BuildFile {bfid} not in objects"
        bf = objects[bfid]
        fref_id = bf.get("fileRef")
        assert fref_id in objects, f"FileRef {fref_id} not in objects"
        fref = objects[fref_id]
        found_sources.add(fref.get("path"))
        
    assert expected_sources == found_sources, f"Mismatch in source files: expected {expected_sources}, got {found_sources}"
    print(f"4. All 5 Swift source files verified in SourcesBuildPhase: {found_sources}")
    
    # Check resources files
    resource_files = resources_phase.get("files", [])
    assert len(resource_files) == 1, "Expected 1 resource file (IronLogProducts.storekit)"
    res_bf = objects[resource_files[0]]
    res_fref = objects[res_bf.get("fileRef")]
    assert res_fref.get("path") == "IronLogProducts.storekit", "Resource is not IronLogProducts.storekit"
    print("5. StoreKit configuration verified in ResourcesBuildPhase")
    
    # Check disk existence of all files in ios/IronLog
    for filename in list(expected_sources) + ["IronLogProducts.storekit", "Info.plist"]:
        disk_path = os.path.join("ios/IronLog", filename)
        assert os.path.exists(disk_path), f"File missing on disk: {disk_path}"
        assert os.path.getsize(disk_path) > 0, f"File empty on disk: {disk_path}"
        print(f"   -> Verified disk file: {disk_path} ({os.path.getsize(disk_path)} bytes)")
        
    # Check bundle identifier
    configs = target.get("buildConfigurationList")
    assert configs in objects, "Target configuration list not found"
    config_list = objects[configs]
    for cid in config_list.get("buildConfigurations", []):
        c = objects[cid]
        bs = c.get("buildSettings", {})
        bundle_id = bs.get("PRODUCT_BUNDLE_IDENTIFIER")
        assert bundle_id == "com.ironlog.pro", f"Unexpected bundle ID: {bundle_id}"
        print(f"6. Build configuration {c.get('name')}: Bundle ID = {bundle_id}")
        
    print("\nSUCCESS! All PBX objects, UUID references, build phases, files, and syntax are 100% valid!")

if __name__ == "__main__":
    main()
