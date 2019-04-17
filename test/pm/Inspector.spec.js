/**
 * @file
 * Defines tests for the Core.cli.pm.Inspector class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @since 6.0.0
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

describe( "Core.cli.pm.Inspector", function() {

	let pmInspector;
	let localFileSystemAdapter;

	before( function() {

		// Use our global test helpers (defined in `test/main.global.js`) to spawn one or
		// more testing objects to satisfy the class dependencies of our target class.
		localFileSystemAdapter = global.cliTestHelpers.initTestDependency( "Core.fs.adapter.Local" );

	} );

	beforeEach( function() {

		// Spawn a pm inspector..
		pmInspector = Core.inst( "Core.cli.pm.Inspector", {
			fileSystemAdapter: localFileSystemAdapter
		} );

	} );

	describe( "#getPmNameForCli()", function() {

		it( "should detect the package manager used to install the Core CLI (XCC)", function() {

			return pmInspector.getPmNameForCli().then(

				function( resolvedPmName ) {

					// This test won't assume the package manager, but
					// we can ensure that we received a string..
					expect( resolvedPmName ).to.be.a( "string" );

				}

			);

		} );

	} );

	describe( "#getGlobalPath()", function() {

		it( "should detect the path of global modules for the PM used to install the Core CLI", function() {

			return pmInspector.getGlobalPath().then(

				function( globalPath ) {

					// This test won't assume the package manager, but we can ensure that we received a string..
					expect( globalPath ).to.be.a( "string" );

					// .. and that string should ALWAYS contain "node_modules"
					expect( globalPath ).to.have.string( "node_modules" );

				}

			);

		} );

	} );

	describe( "#getGlobalDirectory()", function() {

		it( "should return a Directory representing the global module root", function() {

			return pmInspector.getGlobalDirectory().then(

				function( globalDir ) {

					// We should have received a Directory object
					expect( globalDir ).to.be.an.instanceof( Core.cls( "Core.fs.Directory" ) );

					// .. and its path should ALWAYS contain "node_modules"
					expect( globalDir.path ).to.have.string( "node_modules" );

				}

			);

		} );

	} );


	describe( "#getGlobalModules", function() {

		describe( "( opts = null )", function() {

			it( "should return a Map of all global modules as Directory objects", function() {

				return pmInspector.getGlobalModules().then(

					function( globalModules ) {

						console.log( globalModules );

						// We should have received a Directory object
						//expect( globalDir ).to.be.an.instanceof( Core.cls( "Core.fs.Directory" ) );

						// .. and its path should ALWAYS contain "node_modules"
						//expect( globalDir.path ).to.have.string( "node_modules" );

					}

				);

			} );

		} );

	} );

} );
