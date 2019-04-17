/**
 * @file
 * Defines the Core.cli.command.global.ListCommands class.
 *
 * @author Luke Chavers <me@lukechavers.com>
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

// Load dependencies using the Core Framework
const { _ } = Core.deps( "_" );

/**
 * Provides the 'list-commands' command.
 *
 * @memberOf Core.cli.command.global
 * @extends Core.cli.command.BaseCommand
 */
class ListCommands extends Core.cls( "Core.cli.command.BaseCommand" ) {

	$construct( commandLoader ) {

		// Require the `commandLoader` class dep
		this.$require( "commandLoader", {
			instanceOf: "Core.cli.command.Loader"
		} );

		// Persist the class deps
		this._commandLoader = commandLoader;

	}

	get commandLoader() {
		return this._commandLoader;
	}

	static get command() {
		return "list-commands";
	}

	static get description() {
		return "Lists details of all available XCC commands.";
	}

	static async addToCommander( cmd, outputHandler ) {

		// Locals
		let out = outputHandler;

		// Options
		cmd.option( "-d, --details", "Shows additional command information" )
			.option( "-f, --find <string>", "If provided, only commands that match 'string' will be displayed" )

			// Additional text to be displayed in the help message.
			.on( "--help", function() {

				out.log( "" );
				out.log( "Examples:" );
				out.log( "" );
				out.log( "  $ xcc list-commands" );
				out.log( "  $ xcc list-commands -d" );
				out.log( "  $ xcc list-commands -d --find something" );
				out.log( "  $ xcc list-commands -f something" );

			} );

	}

	async execute() {

		// Locals
		let me 			 = this;
		let commandStore = me.commandLoader.commandStore;
		let out          = me.out;
		let showDetails	 = false;
		let findString   = null;

		// Check for the detailed option
		if( me.options.details === true ) {
			showDetails = true;
		}

		// Check for the 'find' option
		if( me.options.find !== undefined && !_.isEmpty( me.options.find ) ) {
			findString = me.options.find;
		}

		// Iterate over each command in the registry/store
		commandStore.forEach(

			function( commandInfo ) {

				// Implements 'find' logic..
				let showThisCommand;
				if( findString === null ) {
					showThisCommand = true;
				} else if( commandInfo.command.command.indexOf( findString ) !== -1 ) {
					showThisCommand = true;
				} else {
					showThisCommand = false;
				}

				// Display the command..
				if( showThisCommand === true ) {

					// Display the command name, with a star..
					let commandName = out.bold( commandInfo.command.command );

					if ( showDetails ) {
						commandName += " " + out.color( "(" + commandInfo.command.className + ")", "grey" );
					}

					out.star( commandName );

					// Display the command description
					out.color( out.indent( commandInfo.command.description, 2 ), "white", true );

					// Show plugin info, if desired
					if ( showDetails ) {

						let plugin     = commandInfo.plugin;
						let pluginInfo = out.color( "From Plugin: ", "green" ) + out.color( plugin.name, "cyan" );

						pluginInfo += " " + out.color( "(" + plugin.packageName + ":" + plugin.version + ")", "grey" );
						//console.log( commandInfo.plugin );

						out.indent( pluginInfo, 2, true );
					}

					// Add a blank line after each command
					out.log( "" );

				}

			}

		);

	}

}

module.exports = ListCommands;
