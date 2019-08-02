/**
 * @file
 * Adds the global CLI commands.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @since 6.0.0
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

let xccPlugin = {

	name		: "Globals",
	description	: "This plugin ships with XCC and provides the global CLI commands.",

	async initNamespaces( /* assetManager */ ) {

		// Special Note: The 'global' plugin does not need to register a namespace
		// because all of the necessary and relevant namespaces have already been
		// registered by the CLI application in ./corefw.js.

		// But it would look something like this..
		// assetManager.registerNamespace(
		//	  "Core.cli.plugin.global.",
		//	  [ __dirname, ".." ]
		// );

	},

	async initCommands( commandLoader ) {

		return commandLoader.addCommands(
			this,
			[
				"Core.cli.command.global.ListCommands",
				"Core.cli.command.global.NodeWatch"
			]
		);

	}

	/*_initPlugin: function( commandLoader, cliController, coreFw ) {

	}*/

};

module.exports = xccPlugin;
