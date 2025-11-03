# Common
    - modal à propos: improve descriptions
    - add a link to the github repo in the modal about
    - Etendre la confirmation de qui à quand on ferme onglet, charge d'autres données...
    - Glisser-déposer : Permettre de charger un fichier par glisser-déposer (drag and drop)
    - creer un moteur qui gere les raccourvis clavier (ctrl s et n notamment)
    - Electron cassé
    -Auto-focus intelligents dans les modales: quand tu ouvres une modale, place le focus sur le premier champ utile (ex: symbole dans “Ajouter grandeur”, fichier dans “Ouvrir”, textarea dans “Calculs”). Ajoute aussi Enter=confirmer, Escape=fermer.

    - mettre une icone en grand (dans le background) de chaque app pour visuellement rapidement voir ou on est.
      - du coup centrer verticalement le splashscreen ?

    - mettre en place une fonction tsv vers pw pour générer des pw

    - ajouter les licences des libs qui n'en ont pas

    - REGRESSI ne lit que les lignes completes. Il faut un disclaimer quand on genere un rw3 incomplet

# Home
    - package linux et macos

# Audio
    - creer un menu comme dans les autres app
    - Ajouter la possibilité de passer les données de audio directement à grapher via sessionStorage
    - preview wave when loading a file
    - fft add 0s to have a power of two and use faster fft ??
    - play the selected part of the audio when downloading

    - function to download the dft too

    - permettre de télécharger depuis les onglets RT et REC et virer le warning
    - creer un wizard pour le téléchargement en étape (comme ca on peut dl a partir de nimporte ou, le choix se fait dans le wizard)

    - mettre en place la confirmation de quit (notament quand on veut creer une nouvelle session)

# Tracker
    - bug or feature ? : frame is downloaded only if all points are set
    - RELATED : centraliser la logique de preparation des données pour CSV rw3, transfert à grapher et clipboard
    - Add vidéos
    - pan and zoom
    - fixed size preview images
    - add a button to stop the decode and still exploit the already decoded frames
    - passer a ffmpeg.wasm

# Grapher
    - permettre de visualiser les bornes des modèles
    - méthode des tangentes
    - possibilité d'avoir 2 axes y

    - utiliser la legende de highcharts pour gerer les courbes actives
    - dropdown pour choisir l'abscisse en bout d'axe

    - BUG : les icones du menu nouveau apparraissent en retard sur le ptb (again)

    - sauvegarder les derniers fichiers dans localStorage ??
    - icones personnalisées
    - export image / print

    - petite animations (pour l'ouverture du panel modèles)

    - ne pas afficher la splashscreen quand on recoit des donné via interapp (de audio ce se voit)

# MISC
    - tester sur petit ecran (et faire les adaptations nécessaires)

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




