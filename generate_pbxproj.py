#!/usr/bin/env python3
import os
import re

pbx_content = """// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 56;
	objects = {

/* Begin PBXBuildFile section */
		1100000128C0000300000001 /* IronLogApp.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1100000128C0000200000001 /* IronLogApp.swift */; };
		1100000128C0000300000002 /* ContentView.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1100000128C0000200000002 /* ContentView.swift */; };
		1100000128C0000300000003 /* StoreKitManager.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1100000128C0000200000003 /* StoreKitManager.swift */; };
		1100000128C0000300000004 /* WebViewBridge.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1100000128C0000200000004 /* WebViewBridge.swift */; };
		1100000128C0000300000005 /* NotificationManager.swift in Sources */ = {isa = PBXBuildFile; fileRef = 1100000128C0000200000005 /* NotificationManager.swift */; };
		1100000128C0000300000006 /* IronLogProducts.storekit in Resources */ = {isa = PBXBuildFile; fileRef = 1100000128C0000200000006 /* IronLogProducts.storekit */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
		1100000128C0000100000006 /* IronLog.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = IronLog.app; sourceTree = BUILT_PRODUCTS_DIR; };
		1100000128C0000200000001 /* IronLogApp.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = IronLogApp.swift; sourceTree = "<group>"; };
		1100000128C0000200000002 /* ContentView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = ContentView.swift; sourceTree = "<group>"; };
		1100000128C0000200000003 /* StoreKitManager.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = StoreKitManager.swift; sourceTree = "<group>"; };
		1100000128C0000200000004 /* WebViewBridge.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = WebViewBridge.swift; sourceTree = "<group>"; };
		1100000128C0000200000005 /* NotificationManager.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = NotificationManager.swift; sourceTree = "<group>"; };
		1100000128C0000200000006 /* IronLogProducts.storekit */ = {isa = PBXFileReference; lastKnownFileType = file; path = IronLogProducts.storekit; sourceTree = "<group>"; };
		1100000128C0000200000007 /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		1100000128C0000400000002 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		1100000128C0000100000003 = {
			isa = PBXGroup;
			children = (
				1100000128C0000100000004 /* IronLog */,
				1100000128C0000100000005 /* Products */,
			);
			sourceTree = "<group>";
		};
		1100000128C0000100000004 /* IronLog */ = {
			isa = PBXGroup;
			children = (
				1100000128C0000200000001 /* IronLogApp.swift */,
				1100000128C0000200000002 /* ContentView.swift */,
				1100000128C0000200000003 /* StoreKitManager.swift */,
				1100000128C0000200000004 /* WebViewBridge.swift */,
				1100000128C0000200000005 /* NotificationManager.swift */,
				1100000128C0000200000006 /* IronLogProducts.storekit */,
				1100000128C0000200000007 /* Info.plist */,
			);
			path = IronLog;
			sourceTree = "<group>";
		};
		1100000128C0000100000005 /* Products */ = {
			isa = PBXGroup;
			children = (
				1100000128C0000100000006 /* IronLog.app */,
			);
			name = Products;
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		1100000128C0000100000002 /* IronLog */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = 1100000128C0000500000006 /* Build configuration list for PBXNativeTarget "IronLog" */;
			buildPhases = (
				1100000128C0000400000001 /* Sources */,
				1100000128C0000400000002 /* Frameworks */,
				1100000128C0000400000003 /* Resources */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = IronLog;
			productName = IronLog;
			productReference = 1100000128C0000100000006 /* IronLog.app */;
			productType = "com.apple.product-type.application";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		1100000128C0000100000001 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 1500;
				LastUpgradeCheck = 1500;
				TargetAttributes = {
					1100000128C0000100000002 = {
						CreatedOnToolsVersion = 15.0;
					};
				};
			};
			buildConfigurationList = 1100000128C0000500000005 /* Build configuration list for PBXProject "IronLog" */;
			compatibilityVersion = "Xcode 14.0";
			developmentRegion = en;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
				Base,
			);
			mainGroup = 1100000128C0000100000003;
			productRefGroup = 1100000128C0000100000005 /* Products */;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				1100000128C0000100000002 /* IronLog */,
			);
		};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		1100000128C0000400000003 /* Resources */ = {
			isa = PBXResourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				1100000128C0000300000006 /* IronLogProducts.storekit in Resources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		1100000128C0000400000001 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
				1100000128C0000300000001 /* IronLogApp.swift in Sources */,
				1100000128C0000300000002 /* ContentView.swift in Sources */,
				1100000128C0000300000003 /* StoreKitManager.swift in Sources */,
				1100000128C0000300000004 /* WebViewBridge.swift in Sources */,
				1100000128C0000300000005 /* NotificationManager.swift in Sources */,
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		1100000128C0000500000001 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = dwarf;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				ENABLE_TESTABILITY = YES;
				GCC_DYNAMIC_NO_PIC = NO;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_OPTIMIZATION_LEVEL = 0;
				GCC_PREPROCESSOR_DEFINITIONS = (
					"DEBUG=1",
					"$(inherited)",
				);
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				IPHONEOS_DEPLOYMENT_TARGET = 16.0;
				MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
				ONLY_ACTIVE_ARCH = YES;
				SDKROOT = iphoneos;
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = "DEBUG $(inherited)";
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
			};
			name = Debug;
		};
		1100000128C0000500000002 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
				CLANG_ANALYZER_NONNULL = YES;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				COPY_PHASE_STRIP = NO;
				DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
				ENABLE_NS_ASSERTIONS = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				GCC_NO_COMMON_BLOCKS = YES;
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				IPHONEOS_DEPLOYMENT_TARGET = 16.0;
				MTL_ENABLE_DEBUG_INFO = NO;
				SDKROOT = iphoneos;
				SWIFT_COMPILATION_MODE = wholemodule;
				SWIFT_OPTIMIZATION_LEVEL = "-O";
				VALIDATE_PRODUCT = YES;
			};
			name = Release;
		};
		1100000128C0000500000003 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				GENERATE_INFOPLIST_FILE = NO;
				INFOPLIST_FILE = IronLog/Info.plist;
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.ironlog.pro;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		1100000128C0000500000004 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				CODE_SIGN_STYLE = Automatic;
				CURRENT_PROJECT_VERSION = 1;
				GENERATE_INFOPLIST_FILE = NO;
				INFOPLIST_FILE = IronLog/Info.plist;
				LD_RUNPATH_SEARCH_PATHS = (
					"$(inherited)",
					"@executable_path/Frameworks",
				);
				MARKETING_VERSION = 1.0.0;
				PRODUCT_BUNDLE_IDENTIFIER = com.ironlog.pro;
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_EMIT_LOC_STRINGS = YES;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Release;
		};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		1100000128C0000500000005 /* Build configuration list for PBXProject "IronLog" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				1100000128C0000500000001 /* Debug */,
				1100000128C0000500000002 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		1100000128C0000500000006 /* Build configuration list for PBXNativeTarget "IronLog" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				1100000128C0000500000003 /* Debug */,
				1100000128C0000500000004 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
/* End XCConfigurationList section */
	};
	rootObject = 1100000128C0000100000001 /* Project object */;
}
"""

with open("ios/IronLog.xcodeproj/project.pbxproj", "w", encoding="utf-8") as f:
    f.write(pbx_content)

print(f"Generated project.pbxproj successfully! Size: {len(pbx_content)} bytes.")
