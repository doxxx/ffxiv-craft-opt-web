'use strict';

/* Services */


var services = angular.module('ffxivCraftOptWeb.services', []);

services.value('_version', '0.1');
services.value('_allActions', [
  { name: "Synthesis", actions: [
    "Basic Synth",
    "Standard Synth",
    "Flawless Synth",
    "Careful Synth",
    "Careful Synth 2",
    "Piece by Piece",
    "Rapid Synthesis",
    "Brand of Earth",
  ]},
  { name: "Quality", actions: [
    "Basic Touch",
    "Standard Touch",
    "Advanced Touch",
    "Hasty Touch",
    "Byregot's Blessing",
  ]},
  { name: "CP", actions: [
    "Comfort Zone",
    "Rumination",
  ]},
  { name: "Durability", actions: [
    "Master's Mend",
    "Master's Mend 2",
    "Waste Not",
    "Waste Not 2",
    "Manipulation",
  ]},
  { name: "Buffs", actions: [
  "Inner Quiet",
  "Steady Hand",
  "Steady Hand 2",
  "Ingenuity",
  "Ingenuity 2",
  "Great Strides",
  "Innovation",
  ]},
  
//  "Observe",
//  "Reclaim",
//  "Tricks of the Trade",
]);
