/**
 * @file
 * Defines the Core.cli.plugin.Manager class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @since 6.0.0
 * @version 1.0
 * @copyright 2019 C2C Schools, LLC
 * @license MIT
 */

"use strict";

// Load dependencies using the Core Framework
const { _, TIPE, VERROR, PATH } = Core.deps( "_", "tipe", "verror", "path" );

/**
 * Handles plugin loading and initialization.
 *
 * @memberOf Core.cli.plugin
 * @extends Core.abstract.Component
 */
class Manager extends Core.mix( "Core.abstract.Component", "Core.asset.mixin.Parenting" ) {

	$construct( commandLoader, pmInspector, localFsAdapter, application ) {

		// Require the `application` class dep
		this._application = this.$require( "application", {
			instanceOf: "Core.cli.Controller"
		} );

		// Require the `commandLoader` class dep
		this._commandLoader = this.$require( "commandLoader", {
			instanceOf: "Core.cli.command.Loader"
		} );

		// Require the `pmInspector` class dep
		this._pmInspector = this.$require( "pmInspector", {
			instanceOf: "Core.cli.pm.Inspector"
		} );

		// Require the `localFsAdapter` class dep
		this._fsAdapter = this.$require( "localFsAdapter", {
			instanceOf: "Core.fs.adapter.Base"
		} );

	}

	/**
	 * Returns the application object (the CLI controller)
	 *
	 * @access public
	 * @default null
	 * @type {Core.cli.Controller}
	 */
	get application() {
		return this._application;
	}

	/**
	 * A convenience alias for `this.application`.
	 *
	 * @access public
	 * @default null
	 * @type {Core.cli.Controller}
	 */
	get cliController() {
		return this.application;
	}

	/**
	 * Returns the application's Ioc Container.
	 *
	 * @access private
	 * @default null
	 * @type {Core.asset.ioc.Container}
	 */
	get _iocContainer() {
		return this.application.iocContainer;
	}

	/**
	 * Returns a function that can be used by plugins to spawn arbitrary classes.
	 *
	 * @access private
	 * @default null
	 * @type {function}
	 */
	get _pluginClassSpawner() {

		// Locals
		let me  = this;

		return function pluginClassSpawner() {
			return me.$spawn.apply( me, arguments );
		};

	}

	get commandLoader() {
		return this._commandLoader;
	}

	get fsAdapter() {
		return this._fsAdapter;
	}

	get pmInspector() {
		return this._pmInspector;
	}

	async loadPlugins() {

		return [ "todo" ];

	}

	async loadPluginAt( path ) {

		// Locals
		let me = this;
		let plugin;


		// todo: this is sloppy & temporary...

		//console.log( "--- Core.cli.plugin.Manager :: loadPluginAt ---" );
		//console.log( path );

		let finalPath = PATH.join( path, "lib/init/xcc-plugin.js" );

		//console.log( finalPath );

		try {
			plugin = require( finalPath );
		} catch( err ) {
			throw new VERROR( err, "Failed to load XCC (Core CLI) plugin" );
		}

		let pluginPackagePath = PATH.join( path, "package.json" );
		let pluginPackage = require( pluginPackagePath );

		plugin.packageName = pluginPackage.name;
		plugin.version = pluginPackage.version;

		// Execute the `initDependencies()` function,
		// if it is provided by the plugin.
		if( TIPE( plugin.initDependencies ) === "function" ) {
			await plugin.initDependencies( Core.assetManager );
		}

		// Execute the `initNamespaces()` function,
		// if it is provided by the plugin.
		if( TIPE( plugin.initNamespaces ) === "function" ) {
			await plugin.initNamespaces( Core.assetManager );
		}

		// Execute the `initServices()` function,
		// if it is provided by the plugin.
		if( TIPE( plugin.initServices ) === "function" ) {
			await plugin.initServices( me._iocContainer, me._pluginClassSpawner );
		}

		// Execute the `initCommands()` function,
		// if it is provided by the plugin.
		if( TIPE( plugin.initCommands ) === "function" ) {
			await plugin.initCommands( me.commandLoader );
		}

	}

}

module.exports = Manager;
