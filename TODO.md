# Common
    - modal à propos: improve descriptions
    - add a link to the github repo in the modal about
    - Etendre la confirmation de qui à quand on ferme onglet, charge d'autres données...
    - Glisser-déposer : Permettre de charger un fichier par glisser-déposer (drag and drop)
    - creer un moteur qui gere les raccourvis clavier (ctrl s et n notamment)
    - Electron cassé

# Home
    - package linux et macos

# Audio
    - creer un menu comme dans les autres app
    - Ajouter la possibilité de passer les données de audio directement à grapher via sessionStorage
    - BUG : dans le fichier téléchargé, les données n'ont pas de nom au lieu d'"amplitude"
    - preview wave when loading a file
    - fft add 0s to have a power of two and use faster fft ??
    - play the selected part of the audio when downloading
    - function to download the dft too

# Tracker
    - bug or feature ? : frame is downloaded only if all points are set
    - RELATED : centraliser la logique de preparation des données pour CSV rw3, transfert à grapher et clipboard
    - Add vidéos
    - pan and zoom
    - fixed size preview images
    - add a button to stop the decode and still exploit the already decoded frames
    - passer a ffmpeg.wasm

# Grapher
    - Ajouter une modale pour modifier les parametres d'une grandeur (nom et unité notamment)
    - permettre de visualiser les bornes des modèles
    - méthode des tangentes
    - possibilité d'avoir 2 axes y

    - utiliser la legende de highcharts pour gerer les courbes actives
    - dropdown pour choisir l'abscisse en bout d'axe

    - BUG : les icones du menu nouveau apparraissent en retard sur le ptb (again)
    - BUG : Revoir la sauvegarde ! (les settings sont peut etre stockés dans le fichier : on veut pas)

    - sauvegarder les derniers fichiers dans localStorage
    - icones personnalisées
    - export image / print

    - gerer quand la modélisation donne des ecart type ou r2 "infinity" Deja fait je crois, à vérifier

    -  - Validation des symboles : La validation des symboles (noms de variables) est effectuée à plusieurs endroits. Cette logique pourrait être centralisée dans une fonction utilitaire pour éviter la duplication de code et garantir une validation cohérente partout dans l'application.

    - permettre voir autoriser les notations 3e-15 (deja partiellemnt possible, à vérifier partout)


# MISC
    - tester sur petit ecran

# Idées
    - animation titrage
    - animation RVB
    - exao spectrophotometre COM
    - appli calculs sur téléphone


# NOTES:
## HANDSONTABLE:
- replace #37bc6c with #00d1b2
- replace --ht-header-active-background-color with #00d1b2
- replace --ht-header-row-active-background-color with #00d1b2
- replace --ht-header-active-border-color: with #00d1b2




