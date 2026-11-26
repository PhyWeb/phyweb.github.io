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

    ajouter des synonymes aux fonctions mathematique genre derivee()

    parametre? pour angles en degrés

    mettre un sous titres dans les colonnes calculées

    bug avec le mode afficher tous les chiffres

    z-index des points selectionnés quand les points sont très serrés.

    une option pour que le premier et le dernier point soient a la limite du graphique et pas à 5% du bord

    ajouter un color picker dans la liste des couleurs pour donner acces a toutes les couleurs possibles.

    améliorer la grille (voir géogebra)

    On empeche l'ouverture de la modale d'edition de nom de grandeur pour les grandeurs calculées... on pourrait peut etre trouver un moyen de laisser la possibilité de changer l'unité voir le nom quand meme

    intercepter les erreurs de mathsjs en anglais et les traduire en langage clair

    othogonalité depuis tracker ???? Essayer le pointage du velo on voit pas le accéléré

    possibilité de facilement écrire des exposants
    
# Mendeleiev
# Optique
# Chromato
# Spectres
# Schemas
    possibilité de grouper des objets
    possibiliter de verouiller un objet
    ajouter un vrai précipité.
    plusieurs styles dans la coupelle
    ajouter une icone différente pour les pws
    outil pour déplacer la vue la ca selectionne avec clique gauche


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