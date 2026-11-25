# Common
    - tester sur petit ecran (et faire les adaptations nécessaires) <== notament spectres et forces
    - continuer d'ajouter des raccourcis clavier

    - Deplacer le a propos dans le menu ?

    - On defullscreen pas quand on essai de drag la fenetre (si?)

    quand on ouvre un .pw, mettre un spinner (sur desktop ca va. tester sur un ordi faible)

# ELECTRON

# Home
    - package linux et macos

# Audio
    - ajout d'un générateur de fonction a l'image de celui généré pour le bac sti2d

# Tracker
    - Add vidéos
    - pan and zoom
    - ajouter une petite handle visuelle pour le redimensionnement du panneau

# Grapher
    - possibilité d'avoir 2 axes y

    - changer le style des points selectionnés dans grapher

    des fonctions non prévues existent (pow, min etc de math.js)

    parametre? pour angles en degrés

    mettre un sous titres dans les colonnes calculées

    bug avecle mode afficher tous les chiffres

    z-index des points selectionnés quand les points sont très serrés.

    pouvoir definir numeriquement les bornes du graphique.

    une option pour que le premier et le dernier point soient a la limite du graphique et pas à 5% du bord

    la ligne du zero en abscisse et ordonnée devrait etre plus grosse

    ajouter un color picker dans la liste des couleurs pour donner acces a toutes les couleurs possibles.

    une option pour renommer les grandeurs dans les exports afin de mettre des espaces par exemple.

    améliorer la grille (voir géogebra)
    
    
    dans l'export, les puissances de 10 ont l'exposant cassé.

    dans l'export il y a parfois des grandeurs rayés ? genre import audio avec fft

    dans l'export il y a PAS les puissances de 10 en bas a droite.

    On empeche l'ouverture de la modale d'edition de nom de grandeur pour les grandeurs calculées... on pourrait peut etre trouver un moyen de laisser la possibilité de changer l'unité voir le nom quand meme

    Bug graphique quand le "nom" d'un modele est trop long genre Amplitudestectrale = f(truclong)

    faire un trier par... trigger le bouton de recalcul...

    intercepter les erreurs de mathsjs en anglais et les traduire en langage clair
    
# Mendeleiev
# Optique
# Chromato
# Spectres
# Schemas
    possibilité de grouper des objets
    possibiliter de verouiller un objet


# MISC
 - tester le flatpak puis flathub
 - tester sous linux la préselection automatique de l'onglet linux dans la modale de téléchargement

 - Possibilité de pwa offline pour ceux qui ont pas acces au store ?

 - tester sur une tablette (apk ?)


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




# CHECKLIST RELEASE
changer la version dans common.js
package.json
appxmanifest.xml
commit & sync
git tag vx.x.x
git push origin vx.x.x

partner.microsoft.com/fr-fr/dashboard/home