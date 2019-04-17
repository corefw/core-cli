/**
 * @file
 * Defines the Core.cli.command.BaseModuleCommand class.
 *
 * @author Luke Chavers <me@lukechavers.com>
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

// Load dependencies using the Core Framework
const { _, TIPE } = Core.deps( "_", "tipe" );

/**
 * A base class for CLI commands that interact with Node.js module projects (which have a package.json file).
 *
 * @memberOf Core.cli.command
 * @extends Core.cli.command.BaseCommand
 */
class BaseModuleCommand extends Core.cls( "Core.cli.command.BaseCommand" ) {

	$construct( currentWorkingDirectory ) {

		// Require the `commandLoader` class dep
		this._cwd = this.$require( "currentWorkingDirectory", {
			instanceOf: "Core.fs.Directory"
		} );

	}

	async getModuleRoot() {

		// Locals
		let me = this;

		// Check for a cached Directory
		if( me._moduleRoot === undefined ) {

			// No cache; find the module root.
			return me._cwd.searchUp( "package.json", true, false ).then(

				function( moduleRoot ) {

					me._moduleRoot = moduleRoot;
					return me._moduleRoot;

				}

			);

		} else {

			return me._moduleRoot;

		}

	}

}

module.exports = BaseModuleCommand;
