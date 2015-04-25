'use strict';

// Declare app level module which depends on filters, and services
angular.module('ffxivCraftOptWeb', [
  'ngTouch',
  'ui.bootstrap',
  'pascalprecht.translate',
  'lvl.directives.dragdrop',
  'ffxivCraftOptWeb.services',
  'ffxivCraftOptWeb.services.actions',
  'ffxivCraftOptWeb.services.localprofile',
  'ffxivCraftOptWeb.services.recipelibrary',
  'ffxivCraftOptWeb.services.simulator',
  'ffxivCraftOptWeb.services.solver',
  'ffxivCraftOptWeb.services.xivdbtooltips',
  'ffxivCraftOptWeb.directives',
  'ffxivCraftOptWeb.filters',
  'ffxivCraftOptWeb.controllers'
])
  .config(function($translateProvider) {
    $translateProvider.translations('en', {
      "Advanced Touch": "Advanced Touch",
      "Standard Synthesis": "Standard Synthesis",
      "Master's Mend II": "Master's Mend II",
      "Great Strides": "Great Strides",
      "Standard Touch": "Standard Touch",
      "Observe": "Observe",
      "Inner Quiet": "Inner Quiet",
      "Steady Hand": "Steady Hand",
      "Master's Mend": "Master's Mend",
      "Basic Touch": "Basic Touch",
      "Basic Synthesis": "Basic Synthesis",

      "Byregot's Blessing": "Byregot's Blessing",
      "Brand of Wind": "Brand of Wind",
      "Rumination": "Rumination",

      "Ingenuity II": "Ingenuity II",
      "Brand of Fire": "Brand of Fire",
      "Inqenuity": "Ingenuity",

      "Piece by Piece": "Piece by Piece",
      "Brand of Ice": "Brand of Ice",
      "Rapid Synthesis": "Rapid Synthesis",

      "Innovation": "Innovation",
      "Flawless Synthesis": "Flawless Synthesis",
      "Manipulation": "Manipulation",

      "Waste Not II": "Waste Not II",
      "Brand of Earth": "Brand of Earth",
      "Waste Not": "Waste Not",

      "Careful Synthesis II": "Careful Synthesis II",
      "Brand of Lightning": "Brand of Lightning",
      "Careful Synthesis": "Careful Synthesis",

      "Comfort Zone": "Comfort Zone",
      "Brand of Water": "Brand of Water",
      "Tricks of the Trade": "Tricks of the Trade",

      "Reclaim": "Reclaim",
      "Steady Hand II": "Steady Hand II",
      "Hasty Touch": "Hasty Touch"
    });

    $translateProvider.translations('de', {
      "Advanced Touch": "Höhere Veredelung",
      "Standard Synthesis": "Solide Bearbeitung",
      "Master's Mend II": "Wiederherstellung II",
      "Great Strides": "Große Schritte",
      "Standard Touch": "Solide Veredelung",
      "Observe": "Beobachten",
      "Inner Quiet": "Innere Ruhe",
      "Steady Hand": "Ruhige Hand",
      "Master's Mend": "Wiederherstellung",
      "Basic Touch": "Veredelung",
      "Basic Synthesis": "Bearbeiten",

      "Byregot's Blessing": "Byregots Benediktion",
      "Brand of Wind": "Zeichen Des Winds",
      "Rumination": "Nachsinnen",

      "Ingenuity II": "Einfallsreichtum II",
      "Brand of Fire": "Zeichen Des Feuers",
      "Inqenuity": "Einfallsreichtum",

      "Piece by Piece": "Stück für Stück",
      "Brand of Ice": "Zeichen des Eises",
      "Rapid Synthesis": "Schnelle Bearbeitung",

      "Innovation": "Innovation",
      "Flawless Synthesis": "Makellose Bearbeitung",
      "Manipulation": "Manipulation",

      "Waste Not II": "Nachhaltigkeit II",
      "Brand of Earth": "Zeichen Der Erde",
      "Waste Not": "Nachhaltigkeit",

      "Careful Synthesis II": "Sorgfältige Bearbeitung II",
      "Brand of Lightning": "Zeichen Des Blitzes",
      "Careful Synthesis": "Sorgfältige Bearbeitung",

      "Comfort Zone": "Komfortzone",
      "Brand of Water": "Zeichen Des Wassers",
      "Tricks of the Trade": "Kunstgriff",

      "Reclaim": "Reklamation",
      "Steady Hand II": "Ruhige Hand II",
      "Hasty Touch": "Hastige Veredelung"
    });

    $translateProvider.translations('fr',{
      "Advanced Touch": "Ouvrage Avancé",
      "Standard Synthesis": "Travail Standard",
      "Master's Mend II": "Réparation De Maître II",
      "Great Strides": "Grands Progrès",
      "Standard Touch": "Ouvrage Standard",
      "Observe": "Observation",
      "Inner Quiet": "Calme Intérieur",
      "Steady Hand": "Main Sûre",
      "Master's Mend": "Réparation De Maître",
      "Basic Touch": "Ouvrage De Base",
      "Basic Synthesis": "Travail De Base",

      "Byregot's Blessing": "Bénédiction De Byregot",
      "Brand of Wind": "Marque Du Vent",
      "Rumination": "Relaxation",

      "Ingenuity II": "Inqéniosité II",
      "Brand of Fire": "Marque Du Feu",
      "Inqenuity": "Inqéniosité",

      "Piece by Piece": "Pièce Par Pièce",
      "Brand of Ice": "Marque De La Glace",
      "Rapid Synthesis": "Travail Rapide",

      "Innovation": "Innovation",
      "Flawless Synthesis": "Travail Sérieux",
      "Manipulation": "Manipulation",

      "Waste Not II": "Parcimonie II",
      "Brand of Earth": "Marque De La Terre",
      "Waste Not": "Parcimonie",

      "Careful Synthesis II": "Synthèse Prudente II",
      "Brand of Lightning": "Marque De La Foudre",
      "Careful Synthesis": "Synthèse Prudente",

      "Comfort Zone": "Zone De Confort",
      "Brand of Water": "Marque De L'eau",
      "Tricks of the Trade": "Ficelles Du Métier",

      "Reclaim": "Récupération",
      "Steady Hand II": "Main Sûre II",
      "Hasty Touch": "Ouvrage Hâtif"
    });

    if (!localStorage.lang) {
      localStorage.lang = 'en';
    }

    $translateProvider.use(localStorage.lang);
  });
