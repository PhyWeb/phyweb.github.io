# Common
    - modal à propos: improve descriptions
    - Glisser-déposer : Permettre de charger un fichier par glisser-déposer (drag and drop)
    - creer un moteur qui gere les raccourvis clavier (ctrl s et n notamment)
    - tester sur petit ecran (et faire les adaptations nécessaires)
    - vérifier que tous les focus automatiques sont ok
    - continuer d'ajouter des raccourcis clavier

    - mettre une icone en grand (dans le background) de chaque app pour visuellement rapidement voir ou on est.
      - du coup centrer verticalement le splashscreen ?

    - ajouter les licences des libs qui n'en ont pas

    - Deplacer le a propos dans le menu ?

    - REGRESSI ne lit que les lignes completes. Il faut un disclaimer quand on genere un rw3 incomplet

    - gerer les quota sessionstorage

# Home
    - package linux et macos

# Audio
    - preview wave when loading a file
    - fft add 0s to have a power of two and use faster fft ??
    - play the selected part of the audio when downloading

    - permettre de télécharger depuis les onglets RT et REC et virer le warning
    - creer un wizard pour le téléchargement en étape (comme ca on peut dl a partir de nimporte ou, le choix se fait dans le wizard)

# Tracker
    - bug or feature ? : frame is downloaded only if all points are set
    - RELATED : centraliser la logique de preparation des données pour CSV rw3, transfert à grapher et clipboard
    - Add vidéos
    - pan and zoom
    - fixed size preview images
    - add a button to stop the decode and still exploit the already decoded frames
    - passer a ffmpeg.wasm

# Grapher
    - création d'un modal pour le cas d'un nouveau fichier comme dans regressi
    - permettre de visualiser les bornes des modèles
    - permettre d'exclure un point d'une modélisation

    - sauvegarder le niveau de zoom et la position de la caméra dans les pw

    - méthode des tangentes
    - possibilité d'avoir 2 axes y

    - BUG : les icones du menu nouveau apparraissent en retard sur le ptb (again)

    - icones personnalisées
    - export image / print

    - le zoom auto marche pas toujours comme il faut. si une serie (x) a une grande valeur alors qu'il n'y a pas de y associé car ligne semi vide. il ne faudrait pas prendre en compte cette valeur (Pas réussi à le reproduire ... fixé ?)

    - améliorer les guess initiaux des paramètres des modélisations.

    - le .pw ou .csv ne devrait pas etre modifiable dans la modale de download

    - permettre d'annuler une modélisation trop longue (en gardant la solution intermediaire ?)

# MISC


# Idées
    - salsaJ ?
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




