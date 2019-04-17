#!/usr/bin/env node

"use strict";

// Initialize the Core Framework and fetch the application igniter
const Igniter = require( "../lib/init/corefw.js" ).igniter;

// Spawn the CLI Controller & Execute
Igniter.ignite( "Core.cli.Controller", {} );
