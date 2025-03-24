Ajout Curve dans Spreadsheet{
    Si premiere courbe => setXCurve
    Si deuxième courbe => push YCurve
}

Suppression courbe dans Spreadsheet{
    Call deleteCurve dans grapher
}

deleteCurve{
    si ni dans X ni dans Y return
    si dans Y => remove de la courbe
    si dans X => setXCurve avec le premier Y si il existe

}

deleteYCurve{

}

setXCurve{

}

setYCurve{

}

updateValues{

}

updateCurves{
    
}

