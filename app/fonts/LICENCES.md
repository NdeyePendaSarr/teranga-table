# Polices hébergées dans le dépôt

Ces fichiers sont ceux que `next/font/google` téléchargeait depuis Google Fonts au moment du build : sous-ensemble « latin », variables (axe de graisse), format WOFF2. Ils sont maintenant versionnés ici pour que le build ne dépende plus du réseau. Le rendu est identique pour les visiteurs.

| Fichier | Police | Version | Copyright |
|---|---|---|---|
| `fraunces-latin.woff2` | Fraunces, romain (axe wght 100–900) | 1.000 | Copyright 2020 The Fraunces Project Authors (github.com/undercasetype/Fraunces) |
| `fraunces-italic-latin.woff2` | Fraunces, italique (axe wght 100–900) | 1.000 | Copyright 2020 The Fraunces Project Authors (github.com/undercasetype/Fraunces) |
| `dm-sans-latin.woff2` | DM Sans (axe wght 100–1000) | 4.004 | Copyright 2014 The DM Sans Project Authors (https://github.com/googlefonts/dm-fonts) |

Copyright et URL de licence lus dans la table `name` de chaque fichier.

## Licence

Les deux familles sont distribuées sous la **SIL Open Font License, version 1.1**, qui autorise leur utilisation, leur modification et leur redistribution avec un logiciel, à condition de conserver le copyright et la licence et de ne pas vendre les polices seules.

- Texte officiel de la licence : https://openfontlicense.org (anciennement https://scripts.sil.org/OFL, l'URL inscrite dans les fichiers)
- Fraunces : https://github.com/undercasetype/Fraunces/blob/main/OFL.txt
- DM Sans : https://github.com/googlefonts/dm-fonts/blob/main/OFL.txt

## Mettre à jour

Le sous-ensemble « latin » couvre tout le français, la ponctuation et le wolof courant, sauf la lettre « ŋ ». Un caractère hors de ce sous-ensemble serait affiché avec la police de secours (Times New Roman ou Arial). Pour changer de version, remplacer le fichier par la version WOFF2 « latin » de Google Fonts ou du dépôt officiel, sous le même nom.
