/**
 * @file
 * Initializes the Core Framework.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @since 6.0.0
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

// Load the Core Framework
const Core = require( "@corefw/common" );

// Fetch the Asset Manager
const Am = Core.assetManager;

// Register Dependencies
// Note that we register functions, and not the dependencies
// themselves, in order to promote lazy-loading.
Am.registerDependencies( {
	"commander"      : () => { return require( "commander" ); 	   },
	"node-symbols"   : () => { return require( "node-symbols" );   },
	"boxen"          : () => { return require( "boxen" ); 	       },
	"tty-table"      : () => { return require( "tty-table" ); 	   },
	"chokidar"       : () => { return require( "chokidar" ); 	   },
	"which-pm"       : () => { return require( "which-pm" ); 	   },
	"yarn-global"    : () => { return require( "yarn-global" );    },
	"global-modules" : () => { return require( "global-modules" ); },
} );

// Add a few dependency aliases
Am.addDependencyAliases( {
	"node-symbols" : "symbols",
	"tty-table"    : "table"
} );

// Register the CLI Namespace
Am.registerNamespace(
	"Core.cli",
	[ __dirname, "../" ]
);

// Return the Core Framework
module.exports = Core;
