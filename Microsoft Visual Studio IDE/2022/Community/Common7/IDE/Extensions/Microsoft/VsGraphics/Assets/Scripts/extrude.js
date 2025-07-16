

//
// extrude.js
//

//
// distance and repeat tool properties
//
var extrudeDistance = 0;
var extrudeRepeat = 1;

//
// we store the tool properties on our command data element
//
var commandData = services.commands.getCommandData("Extrude");
var toolProps;

var hadDistance = commandData.hasTrait("ExtrudeDistance");
var distanceTrait = commandData.getOrCreateTrait("ExtrudeDistance", "float", 0);
if (!hadDistance) {
    // we need to set a default for distance
    distanceTrait.value = 1;
}

//
// special handling for first time access.. we init with default values
//
var hadRepeat = commandData.hasTrait("ExtrudeRepeat");
var repeatTrait = commandData.getOrCreateTrait("ExtrudeRepeat", "float", 0);
if (!hadRepeat) {
    // we didn't have the repeat trait, so set to default value of 1
    repeatTrait.value = 1;
}

//
// store the values from traits into locals
//
extrudeDistance = distanceTrait.value;
extrudeRepeat = repeatTrait.value;

// set the tool props
document.toolProps = commandData;
document.refreshToolPropertyWindow();

function extrude(distance, repeat, geom, polyIndex) {

    var polygonPointCount = geom.getPolygonPointCount(polyIndex);
    if (polygonPointCount < 3) {
        return;
    }

    if (repeat == 0) {
        return;
    }

    var extrudeDir = geom.computePolygonNormal(polyIndex);

    var materialIndex = geom.getPolygonMaterialIndex(polyIndex);

    // this is our starting index for new points
    var newPointStart = geom.pointCount;
    var currentPoint = newPointStart;

    // we gather all the point indices for use when creating polygons
    var pointIndices = new Array();
    for (var i = 0; i < polygonPointCount; i++) {
        var idx = geom.getPolygonPoint(polyIndex, i);
        pointIndices.push(idx);
    }

    // first duplicate the points in the geometry (without adding polygon)
    for (var j = 0; j < repeat; j++) {
        for (var i = 0; i < polygonPointCount; i++) {

            var point = geom.getPointOnPolygon(polyIndex, i);
            point[0] += distance * (j+1) * extrudeDir[0];
            point[1] += distance * (j+1) * extrudeDir[1];
            point[2] += distance * (j+1) * extrudeDir[2];

            geom.addPoints(point, 1);

            pointIndices.push(currentPoint);
            currentPoint++;
        }
    }

    // now create a new polygon
    var newPolyIndex = geom.polygonCount;
    geom.addPolygon(materialIndex);

    var IndexingModePerPointOnPolygon = 3;
    var addTextureCoords = false;

    if (geom.textureCoordinateIndexingMode == IndexingModePerPointOnPolygon)
    {
        addTextureCoords = true;
    }

    // add points to new polygon.
    var newPolyPointStart = newPointStart + (repeat - 1) * polygonPointCount;
    for (var i = 0; i < polygonPointCount; i++) {
        geom.addPolygonPoint(newPolyIndex, newPolyPointStart + i);

        if (addTextureCoords) {
            var texCoord = geom.getTextureCoordinateOnPolygon(polyIndex, i);
            geom.addTextureCoordinates(texCoord, 1);
        }
    }

    // for each segement (we repeat)
    for (var j = 0; j < repeat; j++) {

        // for each edge
        for (var i = 0; i < polygonPointCount; i++) {

            var p0 = i;
            var p1 = i + 1;
            if (p1 >= polygonPointCount) {
                p1 = 0;
            }

            // points i and i + 1 form an edge

            // add a poly containing this edge, edges from each point to the
            // newly duplicted points, and the new edge between the 2 associated duped points
            var thisPolyIndex = geom.polygonCount;
            geom.addPolygon(materialIndex);

            var poly0PointStart = j * polygonPointCount;
            var poly1PointStart = (j + 1) * polygonPointCount;

            var i0 = pointIndices[poly0PointStart + p0];
            var i1 = pointIndices[poly0PointStart + p1];
            var i2 = pointIndices[poly1PointStart + p1];
            var i3 = pointIndices[poly1PointStart + p0];

            geom.addPolygonPoint(thisPolyIndex, i0);
            geom.addPolygonPoint(thisPolyIndex, i1);
            geom.addPolygonPoint(thisPolyIndex, i2);
            geom.addPolygonPoint(thisPolyIndex, i3);

            if (addTextureCoords) {
                var texCoord0 = [0, 0, 1, 0, 1, 1, 0, 1];
                geom.addTextureCoordinates(texCoord0, 4);
            }
        }
    }

    return newPolyIndex;
}

///////////////////////////////////////////////////////////////////////////////
//
// helper to get a designer property as a bool
//
///////////////////////////////////////////////////////////////////////////////
function getDesignerPropAsBool(tname) {
    if (document.designerProps.hasTrait(tname))
        return document.designerProps.getTrait(tname).value;

    return false;
}

function getSelectionMode() {
    if (getDesignerPropAsBool("usePivot"))
        return 0; // default to object mode when using pivot
    if (document.designerProps.hasTrait("SelectionMode"))
        return document.designerProps.getTrait("SelectionMode").value;
    return 0;
}


// find the mesh child
function findFirstChildMeshElement(parent)
{
    // find the mesh child
    for (var i = 0; i < parent.childCount; i++) {

        // get child and its materials
        var child = parent.getChild(i);
        if (child.typeId == "Microsoft.VisualStudio.3D.Mesh") {
            return child;
        }
    }
    return null;
}

function UndoableItem(dist, repeat, collElem, meshElem) {
    this._extrudeDistance = dist;
    this._extrudeRepeat = repeat;

    var clonedColl = collElem.clone();
    this._collectionElem = clonedColl;
    this._polyCollection = clonedColl.behavior;
    this._meshElem = meshElem;
    this._mesh = meshElem.behavior;

    var geom = this._meshElem.getTrait("Geometry").value;
    this._restoreGeom = geom.clone();

    this.getName = function () {
        var IDS_MreUndoExtrude = 146;
        return services.strings.getStringFromId(IDS_MreUndoExtrude);
    }

    this.onDo = function () {

        var geom = this._meshElem.getTrait("Geometry").value;

        var polysToDelete = new Array();
        var polysToSelect = new Array();

        // extrude
        var polyCount = this._polyCollection.getPolygonCount();
        for (var i = 0; i < polyCount; i++) {
            var polyIndex = this._polyCollection.getPolygon(i);
            var newPoly = extrude(this._extrudeDistance, this._extrudeRepeat, geom, polyIndex);

            // services.debug.trace("[Extrude] extruding poly index " + polyIndex);
            // services.debug.trace("[Extrude] adding poly index " + newPoly);

            polysToSelect.push(newPoly);
            polysToDelete.push(polyIndex);
        }

        function sortNumberDescending(a, b) {
            return b - a;
        }

        // delete the old selection
        polysToDelete.sort(sortNumberDescending);

        var numDeletedPolys = polysToDelete.length;

        for (var p = 0; p < polysToDelete.length; p++) {

            // services.debug.trace("[Extrude] removing poly index " + polyIndex);

            geom.removePolygon(polysToDelete[p]);
        }

        var newCollection = this._collectionElem.clone();
        var newPolyCollBeh = newCollection.behavior;

        newPolyCollBeh.clear();

        // shift polygon indices
        for (var p = 0; p < polysToSelect.length; p++) {
            var indexToSelect = polysToSelect[p] - numDeletedPolys;

            // services.debug.trace("[Extrude] selecting poly index " + indexToSelect);

            newPolyCollBeh.addPolygon(indexToSelect);
        }

        this._mesh.selectedObjects = newCollection;
        this._mesh.recomputeCachedGeometry();
    }

    this.onUndo = function () {
        var geom = this._meshElem.getTrait("Geometry").value;
        geom.copyFrom(this._restoreGeom);

        this._mesh.selectedObjects = this._collectionElem;

        this._mesh.recomputeCachedGeometry();
    }
}


if (extrudeRepeat != 0) {

    var selectedElement = document.selectedElement;
    var selectionMode = getSelectionMode();

    // get the poly collection
    var polyCollection = null;
    var mesh = null;
    var meshElem = null;
    var collElem = null;
    if (selectedElement != null) {
        if (selectionMode == 1) {
            meshElem = findFirstChildMeshElement(selectedElement);
            if (meshElem != null) {
                mesh = meshElem.behavior;

                // polygon selection mode
                collElem = mesh.selectedObjects;
                if (collElem != null) {
                    polyCollection = collElem.behavior;
                }
            }
        }
    }

    if (polyCollection != null && collElem.typeId == "PolygonCollection") {
        var undoableItem = new UndoableItem(extrudeDistance, extrudeRepeat, collElem, meshElem);
        undoableItem.onDo();
        services.undoService.addUndoableItem(undoableItem);
    }
}

// SIG // Begin signature block
// SIG // MIIoKAYJKoZIhvcNAQcCoIIoGTCCKBUCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // kz9XY8lqiFVbcL5uZ5PFVCKKJ4t4jMlzh48n5M8YHxqg
// SIG // gg12MIIF9DCCA9ygAwIBAgITMwAABARsdAb/VysncgAA
// SIG // AAAEBDANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTI0MDkxMjIwMTExNFoX
// SIG // DTI1MDkxMTIwMTExNFowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // tCg32mOdDA6rBBnZSMwxwXegqiDEUFlvQH9Sxww07hY3
// SIG // w7L52tJxLg0mCZjcszQddI6W4NJYb5E9QM319kyyE0l8
// SIG // EvA/pgcxgljDP8E6XIlgVf6W40ms286Cr0azaA1f7vaJ
// SIG // jjNhGsMqOSSSXTZDNnfKs5ENG0bkXeB2q5hrp0qLsm/T
// SIG // WO3oFjeROZVHN2tgETswHR3WKTm6QjnXgGNj+V6rSZJO
// SIG // /WkTqc8NesAo3Up/KjMwgc0e67x9llZLxRyyMWUBE9co
// SIG // T2+pUZqYAUDZ84nR1djnMY3PMDYiA84Gw5JpceeED38O
// SIG // 0cEIvKdX8uG8oQa047+evMfDRr94MG9EWwIDAQABo4IB
// SIG // czCCAW8wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFPIboTWxEw1PmVpZS+AzTDwo
// SIG // oxFOMEUGA1UdEQQ+MDykOjA4MR4wHAYDVQQLExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xFjAUBgNVBAUTDTIzMDAx
// SIG // Mis1MDI5MjMwHwYDVR0jBBgwFoAUSG5k5VAF04KqFzc3
// SIG // IrVtqMp1ApUwVAYDVR0fBE0wSzBJoEegRYZDaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNybDBhBggr
// SIG // BgEFBQcBAQRVMFMwUQYIKwYBBQUHMAKGRWh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // Q29kU2lnUENBMjAxMV8yMDExLTA3LTA4LmNydDAMBgNV
// SIG // HRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4ICAQCI5g/S
// SIG // KUFb3wdUHob6Qhnu0Hk0JCkO4925gzI8EqhS+K4umnvS
// SIG // BU3acsJ+bJprUiMimA59/5x7WhJ9F9TQYy+aD9AYwMtb
// SIG // KsQ/rst+QflfML+Rq8YTAyT/JdkIy7R/1IJUkyIS6srf
// SIG // G1AKlX8n6YeAjjEb8MI07wobQp1F1wArgl2B1mpTqHND
// SIG // lNqBjfpjySCScWjUHNbIwbDGxiFr93JoEh5AhJqzL+8m
// SIG // onaXj7elfsjzIpPnl8NyH2eXjTojYC9a2c4EiX0571Ko
// SIG // mhENF3RtR25A7/X7+gk6upuE8tyMy4sBkl2MUSF08U+E
// SIG // 2LOVcR8trhYxV1lUi9CdgEU2CxODspdcFwxdT1+G8YNc
// SIG // gzHyjx3BNSI4nOZcdSnStUpGhCXbaOIXfvtOSfQX/UwJ
// SIG // oruhCugvTnub0Wna6CQiturglCOMyIy/6hu5rMFvqk9A
// SIG // ltIJ0fSR5FwljW6PHHDJNbCWrZkaEgIn24M2mG1M/Ppb
// SIG // /iF8uRhbgJi5zWxo2nAdyDBqWvpWxYIoee/3yIWpquVY
// SIG // cYGhJp/1I1sq/nD4gBVrk1SKX7Do2xAMMO+cFETTNSJq
// SIG // fTSSsntTtuBLKRB5mw5qglHKuzapDiiBuD1Zt4QwxA/1
// SIG // kKcyQ5L7uBayG78kxlVNNbyrIOFH3HYmdH0Pv1dIX/Mq
// SIG // 7avQpAfIiLpOWwcbjzCCB3owggVioAMCAQICCmEOkNIA
// SIG // AAAAAAMwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBSb290
// SIG // IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDExMB4XDTEx
// SIG // MDcwODIwNTkwOVoXDTI2MDcwODIxMDkwOVowfjELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEoMCYGA1UEAxMfTWljcm9zb2Z0
// SIG // IENvZGUgU2lnbmluZyBQQ0EgMjAxMTCCAiIwDQYJKoZI
// SIG // hvcNAQEBBQADggIPADCCAgoCggIBAKvw+nIQHC6t2G6q
// SIG // ghBNNLrytlghn0IbKmvpWlCquAY4GgRJun/DDB7dN2vG
// SIG // EtgL8DjCmQawyDnVARQxQtOJDXlkh36UYCRsr55JnOlo
// SIG // XtLfm1OyCizDr9mpK656Ca/XllnKYBoF6WZ26DJSJhIv
// SIG // 56sIUM+zRLdd2MQuA3WraPPLbfM6XKEW9Ea64DhkrG5k
// SIG // NXimoGMPLdNAk/jj3gcN1Vx5pUkp5w2+oBN3vpQ97/vj
// SIG // K1oQH01WKKJ6cuASOrdJXtjt7UORg9l7snuGG9k+sYxd
// SIG // 6IlPhBryoS9Z5JA7La4zWMW3Pv4y07MDPbGyr5I4ftKd
// SIG // gCz1TlaRITUlwzluZH9TupwPrRkjhMv0ugOGjfdf8NBS
// SIG // v4yUh7zAIXQlXxgotswnKDglmDlKNs98sZKuHCOnqWbs
// SIG // YR9q4ShJnV+I4iVd0yFLPlLEtVc/JAPw0XpbL9Uj43Bd
// SIG // D1FGd7P4AOG8rAKCX9vAFbO9G9RVS+c5oQ/pI0m8GLhE
// SIG // fEXkwcNyeuBy5yTfv0aZxe/CHFfbg43sTUkwp6uO3+xb
// SIG // n6/83bBm4sGXgXvt1u1L50kppxMopqd9Z4DmimJ4X7Iv
// SIG // hNdXnFy/dygo8e1twyiPLI9AN0/B4YVEicQJTMXUpUMv
// SIG // dJX3bvh4IFgsE11glZo+TzOE2rCIF96eTvSWsLxGoGyY
// SIG // 0uDWiIwLAgMBAAGjggHtMIIB6TAQBgkrBgEEAYI3FQEE
// SIG // AwIBADAdBgNVHQ4EFgQUSG5k5VAF04KqFzc3IrVtqMp1
// SIG // ApUwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAUci06AjGQQ7kUBU7h6qfHMdEjiTQwWgYDVR0f
// SIG // BFMwUTBPoE2gS4ZJaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // MjAxMV8yMDExXzAzXzIyLmNybDBeBggrBgEFBQcBAQRS
// SIG // MFAwTgYIKwYBBQUHMAKGQmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0MjAx
// SIG // MV8yMDExXzAzXzIyLmNydDCBnwYDVR0gBIGXMIGUMIGR
// SIG // BgkrBgEEAYI3LgMwgYMwPwYIKwYBBQUHAgEWM2h0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvZG9jcy9w
// SIG // cmltYXJ5Y3BzLmh0bTBABggrBgEFBQcCAjA0HjIgHQBM
// SIG // AGUAZwBhAGwAXwBwAG8AbABpAGMAeQBfAHMAdABhAHQA
// SIG // ZQBtAGUAbgB0AC4gHTANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // Z/KGpZjgVHkaLtPYdGcimwuWEeFjkplCln3SeQyQwWVf
// SIG // Liw++MNy0W2D/r4/6ArKO79HqaPzadtjvyI1pZddZYSQ
// SIG // fYtGUFXYDJJ80hpLHPM8QotS0LD9a+M+By4pm+Y9G6XU
// SIG // tR13lDni6WTJRD14eiPzE32mkHSDjfTLJgJGKsKKELuk
// SIG // qQUMm+1o+mgulaAqPyprWEljHwlpblqYluSD9MCP80Yr
// SIG // 3vw70L01724lruWvJ+3Q3fMOr5kol5hNDj0L8giJ1h/D
// SIG // Mhji8MUtzluetEk5CsYKwsatruWy2dsViFFFWDgycSca
// SIG // f7H0J/jeLDogaZiyWYlobm+nt3TDQAUGpgEqKD6CPxNN
// SIG // ZgvAs0314Y9/HG8VfUWnduVAKmWjw11SYobDHWM2l4bf
// SIG // 2vP48hahmifhzaWX0O5dY0HjWwechz4GdwbRBrF1HxS+
// SIG // YWG18NzGGwS+30HHDiju3mUv7Jf2oVyW2ADWoUa9WfOX
// SIG // pQlLSBCZgB/QACnFsZulP0V3HjXG0qKin3p6IvpIlR+r
// SIG // +0cjgPWe+L9rt0uX4ut1eBrs6jeZeRhL/9azI2h15q/6
// SIG // /IvrC4DqaTuv/DDtBEyO3991bWORPdGdVk5Pv4BXIqF4
// SIG // ETIheu9BCrE/+6jMpF3BoYibV3FWTkhFwELJm3ZbCoBI
// SIG // a/15n8G9bW1qyVJzEw16UM0xghoKMIIaBgIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAE
// SIG // BGx0Bv9XKydyAAAAAAQEMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCBZTEg7jdDs/bdc1CevgeJqTz7/iB5xFHkt
// SIG // 9D1BcppOmjBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBACldVKs5
// SIG // epnRsSrMLqMouL9SEmPrIeCdcLLcu7/CCuvyV7ZSIBiP
// SIG // mXw9P4LAAgESi1aYdoB8GnjW7no9ZyTQw+fjn1SZrAtc
// SIG // eE967HAbhyb8ZHF0FtuwjtHbMewobLfvkq/W4KBl5gSF
// SIG // wLArSbcCOpM4QqZXiDFl3J7icgB0a+fqppJeEYCcz6WA
// SIG // yu61fX00oPuK8juh0JolIDcXlaZMo/y3sZsHLOXwh091
// SIG // UjKUX6yr/962DGf6EcjSIkUD5kPWZ0Sc7TJSyF4oDF5l
// SIG // wupjAtv04U1RaSV13bTlOfDddCX7zoCno78iOJM0+W+K
// SIG // 8Q+j2lvZLBYwBNpsUMKyNxjT68ShgheUMIIXkAYKKwYB
// SIG // BAGCNwMDATGCF4Awghd8BgkqhkiG9w0BBwKgghdtMIIX
// SIG // aQIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUgYLKoZIhvcN
// SIG // AQkQAQSgggFBBIIBPTCCATkCAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgyNIWfJTfKDA2edKqGUVx
// SIG // w4Ywft1rNMz3/E9vKgV5DdECBmf3vPYi6hgTMjAyNTA0
// SIG // MTUxOTM3NDIuNDUyWjAEgAIB9KCB0aSBzjCByzELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0
// SIG // IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMeblNo
// SIG // aWVsZCBUU1MgRVNOOkE5MzUtMDNFMC1EOTQ3MSUwIwYD
// SIG // VQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNl
// SIG // oIIR6jCCByAwggUIoAMCAQICEzMAAAIMuWTjNZzs9K4A
// SIG // AQAAAgwwDQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwHhcNMjUwMTMwMTk0MzAwWhcN
// SIG // MjYwNDIyMTk0MzAwWjCByzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNO
// SIG // OkE5MzUtMDNFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG
// SIG // 9w0BAQEFAAOCAg8AMIICCgKCAgEAygFWJj3kbYGv1Oo8
// SIG // 6sqiw9DAKKJdt4HATefPmf17JGMDSbGfjvsFckGJfHT0
// SIG // ytfwQtsQInNZvib3JKo1WkN9iplEbBGaLYq0GODylVvn
// SIG // l8Ebd6+rM4C7onOqqB5W16Mf5dBybYFEZMw11jJCphki
// SIG // +8/P3K6nL5mKr/Lf7JQBeCfpqc2/bTBVZo8ClzjVXUcI
// SIG // PUN1mj2QQu1r6Iuz0SDdo4I0gZx2MgGUpbLSja6WG+vh
// SIG // ruqEhZEMxqUeufkDQ3ZD+Lnzn+D2zoN32+Lhj4yPBDyp
// SIG // acDMGotZEMl/n4HIAqFfSfqPDGGAmVHrd5M4YcEc6oei
// SIG // zHg42lyz+9NUl14l3NmR87gx20v7GbSd+tu3FaQpVxCF
// SIG // L4Nsaa9Kz5SLR8LY6NT8DAqV2Kp2Cr1/GifJ2sE/VvBV
// SIG // LrsmTxtfOdvquI5FZXii+8fu3pfBE3oW3ZMHYQF8l4pm
// SIG // hM1nrTTUphvynxwKfXM8LC9byq+EYJ/qSCJGR7qJnX+X
// SIG // uPNSvsSFoSwj3ablfOxKhjiv424Tp2RKsHbwNAJTGi37
// SIG // JgnpmZrqXo2mLhJNOf+nAlMYBeMwp5CXmHTAD/vWeJFY
// SIG // e7c0RbMP5WUpdg+xISAOip4+kX3x9pO2LUhkr/Ogkoc3
// SIG // 4l2s/curE7vEhqhejmy/3rvw5Ir8laAn1F1i44kibK0u
// SIG // tw9BBx0CAwEAAaOCAUkwggFFMB0GA1UdDgQWBBR1DkUh
// SIG // /7Af60P23g9JeVcUO9OhiDAfBgNVHSMEGDAWgBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQ
// SIG // hk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENB
// SIG // JTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwG
// SIG // CCsGAQUFBzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUt
// SIG // U3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMB
// SIG // Af8EAjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMIMA4G
// SIG // A1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // 2TD6+IFZsMH+BjAeWXx0q9+LoboOss7uB1E/iVjGas/b
// SIG // oS2QaF+Qj43Sic8AFb2KDbi5ktPvZQOUu+K7yqnf7vb6
// SIG // fPFRpOlO4DHHmrXaqSpW1UXZ9mX6zHKSOMznOgbbmK8y
// SIG // VeHBLNWJl/ebogMWhA9+MNNgZ37j2VwNHnbAwW3eIsRV
// SIG // PF/9SdA3yFJNWBWDzq5sJiNpNeruk3CjtGKUZcE3Qqvb
// SIG // ztHhCBEdUi5kDQc1/YdnHAr7YHpDmgaCEN2UWovA7NX/
// SIG // sHCgj8w+Kg198TYLyxYiqAOmUhvUv8jqxmokhiHg8uTf
// SIG // VULqkzY68rgM473+VvAEKd9YVdRm1AzpG1HXfs5CVil+
// SIG // BZs3njedhBG8pKFnCeVfTOAzxjecaRal8vWjtPnUdFFG
// SIG // Frqni4Q8kZ1XmXExLtMYJqPqUB2rhVQErFTkTKfExfHa
// SIG // XrHfrapJEPFTbyNtKDn503y/u2YFDH+6jVdJZdFqOZ5a
// SIG // 9Qib2tW35Nh3OQWNTPbHd25QZHs8ryT5+I9G3zjqwmE8
// SIG // GLDbI4kZf1ltfDTqYsKnIsBZVDarVgkTMwva/OGGlDEP
// SIG // NgcsJOPHeLgaJ+WQPKV10u48CU4yY+VEnkZfb40/fDw2
// SIG // cghTtnhUjhXQ3X+lgaP1mVANoRmdKvie49eNH21wnzlC
// SIG // JtI9tx2gFdHJA0v55gv6BdYwggdxMIIFWaADAgECAhMz
// SIG // AAAAFcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUA
// SIG // MIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylN
// SIG // aWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3Jp
// SIG // dHkgMjAxMDAeFw0yMTA5MzAxODIyMjVaFw0zMDA5MzAx
// SIG // ODMyMjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
// SIG // 5OGmTOe0ciELeaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1
// SIG // V/YBf2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeF
// SIG // RiMMtY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDc
// SIG // wUTIcVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus
// SIG // 9ja+NSZk2pg7uhp7M62AW36MEBydUv626GIl3GoPz130
// SIG // /o5Tz9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHI
// SIG // NSi947SHJMPgyY9+tVSP3PoFVZhtaDuaRr3tpK56KTes
// SIG // y+uDRedGbsoy1cCGMFxPLOJiss254o2I5JasAUq7vnGp
// SIG // F1tnYN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+
// SIG // /NmeRd+2ci/bfV+AutuqfjbsNkz2K26oElHovwUDo9Fz
// SIG // pk03dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz1dhzPUNO
// SIG // wTM5TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLi
// SIG // Mxhy16cg8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5
// SIG // UPkLiWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9Q
// SIG // BXpsxREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6H
// SIG // XtqPnhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIG
// SIG // CSsGAQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYE
// SIG // FCqnUv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSf
// SIG // pxVdAF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEG
// SIG // DCsGAQQBgjdMg30BATBBMD8GCCsGAQUFBwIBFjNodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0RvY3Mv
// SIG // UmVwb3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUH
// SIG // AwgwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYD
// SIG // VR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0j
// SIG // BBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0f
// SIG // BE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0
// SIG // XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBK
// SIG // BggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0w
// SIG // Ni0yMy5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1Vffwq
// SIG // reEsH2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1
// SIG // OdfCcTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi7ulmZzpT
// SIG // Td2YurYeeNg2LpypglYAA7AFvonoaeC6Ce5732pvvinL
// SIG // btg/SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l
// SIG // 9qRWqveVtihVJ9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJ
// SIG // w7wXsFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2Fz
// SIG // Lixre24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7
// SIG // hvoyGtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY
// SIG // 3UA8x1RtnWN0SCyxTkctwRQEcb9k+SS+c23Kjgm9swFX
// SIG // SVRk2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFU
// SIG // a2pFEUep8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz
// SIG // /gq77EFmPWn9y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/
// SIG // AsGConsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1
// SIG // ZyvgDbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328
// SIG // y+l7vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEG
// SIG // ahC0HVUzWLOhcGbyoYIDTTCCAjUCAQEwgfmhgdGkgc4w
// SIG // gcsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJTAjBgNVBAsTHE1p
// SIG // Y3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlvbnMxJzAlBgNV
// SIG // BAsTHm5TaGllbGQgVFNTIEVTTjpBOTM1LTAzRTAtRDk0
// SIG // NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUA77vIZIRDLeWf
// SIG // C3Xn5bO89S1VPKaggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQsFAAIFAOuo
// SIG // 0oUwIhgPMjAyNTA0MTUxMjQxNDFaGA8yMDI1MDQxNjEy
// SIG // NDE0MVowdDA6BgorBgEEAYRZCgQBMSwwKjAKAgUA66jS
// SIG // hQIBADAHAgEAAgIHLDAHAgEAAgISazAKAgUA66okBQIB
// SIG // ADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZCgMC
// SIG // oAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqGSIb3
// SIG // DQEBCwUAA4IBAQBfYLPKz+lKiCpqXyKfQWHWVaUkSr6Z
// SIG // 9SBnt/hR8amtk7TjvOsoEq6MVua1Yng+hIGDRGI3hsR/
// SIG // jc6gsq0JcWLUBRwGIAHXN872cfJShD0tTKzx3hHhU+z4
// SIG // s/xN2+eS0rHr7VvcPCfSH2RQv1dPTFloYVjspRqJychK
// SIG // txI7EOZF2sQwoypXvKM5eCmCf5bOxFe+QXnGB37e4uRt
// SIG // WtEEQKHNsHXsShZxdS0Nj7ys2LKnugUBFLb6BD+Lz2U6
// SIG // D0HcczQrJeFlMOsnxHjmumGzSzK+7zVcidhGQaRV3o/P
// SIG // cSE8edGqZuNWtBfDdow6wTL5NwxB4eQaZsavwvWwB/QF
// SIG // RAUaMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAIMuWTjNZzs9K4AAQAAAgww
// SIG // DQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3DQEJAzEN
// SIG // BgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQxIgQgGN6I
// SIG // xl9BBNVKWvb/1PKt5VvyBj5lKDFUYe39WkJ9WigwgfoG
// SIG // CyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCDVKNe3BTGT
// SIG // eOjCOTXyAIPVMeXDucTPYp63ua4rjmfCLTCBmDCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAC
// SIG // DLlk4zWc7PSuAAEAAAIMMCIEIHMFdMCMVzOi8xGOQp2s
// SIG // QICl1ve4DImuc36e7wqBrLVPMA0GCSqGSIb3DQEBCwUA
// SIG // BIICADjYK0V5sEv0uPsamw+r/A+1+TwSFzkXd3KWGAwU
// SIG // QgxIJVLkUwyK+r7j9tg5FcOjbyBRg/lhxF56lxL3kWZr
// SIG // pgyrA6kEoqoxDF4L2e9i3ytj1th4ZAszdTMY6U0ytGY2
// SIG // VqAAnYHHOivgA1REHO9egklK9tooViaREFYP2USGt12d
// SIG // tyhwOrhccNGv0VsRwpAPNnD/PNMY9hbQYmzL2DgQ0vmi
// SIG // Nqz2znGqDBCDm8V84euTS9xJwyCFHKoi+zmqTPnDamAb
// SIG // dgntnS5khGdfcOI7zzqqwT6ERphLssOmErNpl6fOTHvl
// SIG // Vz/uYIjdduoewtGJeUzxCeEKAj8nRFHCmjDMGHhaJsGb
// SIG // XVwFzgh+VfH5QMwgfFiOYMPc4j9jXxqCmdnQC27kyK9o
// SIG // PPvNY6xApSA2sjeEA4wmCcMa04vUPRlywnZfAATU27+d
// SIG // mhsV9tcU+kWiXaVIvESSPuftytJRWRazJ7uMn1wdpcvH
// SIG // njOdqeBFZv8TZY6P0f1a2kJBEGakxqe5hqebvMwISSGj
// SIG // j7surwK0sfg830txvbSiQ5k+0YVYzxqr+OhA9rJujEVk
// SIG // YMfcOw8btJkK8ii5qGl1oRX3g1Ok5Todfb9JNFl88Lsz
// SIG // 1yfCVGR3dQQ7EH6hCR7j90OP15S09nyxL5wrlBd9kJ+O
// SIG // qj3O6fi4OGq4bx3dKAt5MhMBXIGP
// SIG // End signature block
