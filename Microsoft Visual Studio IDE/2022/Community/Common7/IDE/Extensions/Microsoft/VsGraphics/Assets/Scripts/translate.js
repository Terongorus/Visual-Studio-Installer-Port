//
// Copyright (c) Microsoft Corporation.  All rights reserved.
//
//
// Use of this source code is subject to the terms of the Microsoft shared
// source or premium shared source license agreement under which you licensed
// this source code. If you did not accept the terms of the license agreement,
// you are not authorized to use this source code. For the terms of the license,
// please see the license agreement between you and Microsoft or, if applicable,
// see the SOURCE.RTF on your install media or the root of your tools installation.
// THE SOURCE CODE IS PROVIDED "AS IS", WITH NO WARRANTIES OR INDEMNITIES.
//

// services.debug.trace("Translating");

///////////////////////////////////////////////////////////////////////////////
//
// Helper functions 
//
///////////////////////////////////////////////////////////////////////////////
function getCameraElement() {
    var camera = document.elements.findElementByTypeId("Microsoft.VisualStudio.3D.PerspectiveCamera");
    return camera;
}

function getWorldMatrix(element) {
    return element.getTrait("WorldTransform").value;
}

function getFrustumHeightAtDepth(zDepth, fovy) {
    var angle = (fovy * 0.5) * 3.14 / 180.0;
    return 2.0 * zDepth * Math.tan(angle);
}

function getParentToLocal(element) {
    var localToWorldMatrix = getWorldMatrix(element);
    var worldToLocal = math.getInverse(localToWorldMatrix);

    var parent = element.parent;
    if (parent != null) {
        var parentToWorld = getWorldMatrix(parent);

        return math.multiplyMatrix(worldToLocal, parentToWorld);
    }
    else {
        return worldToLocal;
    }
}

function getFirstSelectedWithoutAncestorInSelection() {
    var count = services.selection.count;
    for (var i = 0; i < count; i++) {
        var currSelected = services.selection.getElement(i);

        //
        // don't operate on items whose parents (in scene) are ancestors
        // since this will double the amount of translation applied to those
        //
        var hasAncestor = false;
        for (var otherIndex = 0; otherIndex < count; otherIndex++) {
            if (otherIndex != i) {
                var ancestor = services.selection.getElement(otherIndex);
                if (currSelected.behavior.isAncestor(ancestor)) {
                    hasAncestor = true;
                    break;
                }
            }
        }

        if (!hasAncestor) {
            return currSelected;
        }
    }
    return null;
}

///////////////////////////////////////////////////////////////////////////////
//
// heper to get a designer property as a bool
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

function getCommandState(commandName) {
    var commandData = services.commands.getCommandData(commandName);
    if (commandData != null) {
        var trait = commandData.getTrait("state");
        if (trait != null) {
            return trait.value;
        }
    }
    return -1;
}

///////////////////////////////////////////////////////////////////////////////
//
// Button state trait
//
///////////////////////////////////////////////////////////////////////////////

var state = command.getTrait("state");

///////////////////////////////////////////////////////////////////////////////
//
// Property window and tool settings 
//
///////////////////////////////////////////////////////////////////////////////
var enablePropertyWindow = 8;

var stepAmount = 5.0;

function StepAmountChanged(sender, args) {
    stepAmount = document.toolProps.getTrait("StepAmount").value;
}


var toolProps;
var toolPropCookie;
var snapCookie;
function createOptions() {

    var snapTrait = document.designerProps.getOrCreateTrait("snap", "bool", 0);
    snapCookie = snapTrait.addHandler("OnDataChanged", OnSnapEnabledTraitChanged);

    toolProps = document.createElement("toolProps", "type", "toolProps");
    toolProps.getOrCreateTrait("StepAmount", "float", enablePropertyWindow);
    document.toolProps = toolProps;

    toolProps.getTrait("StepAmount").value = stepAmount;

    // Set up the callback when the option traits are changed
    toolPropCookie = toolProps.getTrait("StepAmount").addHandler("OnDataChanged", StepAmountChanged);

    OnSnapEnabledTraitChanged(null, null);
}

function OnSnapEnabledTraitChanged(sender, args) {
    var snapTrait = document.designerProps.getOrCreateTrait("snap", "bool", 0);
    if (toolProps != null) {
        var stepAmountTrait = toolProps.getTrait("StepAmount");
        if (stepAmountTrait != null) {
            var newFlags = stepAmountTrait.flags;
            if (snapTrait.value) {
                newFlags |= enablePropertyWindow;
            }
            else {
                newFlags &= ~enablePropertyWindow;
            }
            stepAmountTrait.flags = newFlags;

            document.refreshPropertyWindow();
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
//
// Manipulator registration and event handling
//
///////////////////////////////////////////////////////////////////////////////
var manipulatorData = services.manipulators.getManipulatorData("TranslationManipulator");
var manipulator = services.manipulators.getManipulator("TranslationManipulator");
var undoableItem;

function getTranslationTraitId() {
    var translationTraitId;
    if (getDesignerPropAsBool("usePivot")) {
        translationTraitId = "PivotTranslation";
    }
    else {
        translationTraitId = "Translation";
    }
    return translationTraitId;
}

// find the mesh child
function findFirstChildMesh(parent)
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

///////////////////////////////////////////////////////////////////////////////
//
// Translation logic
//
///////////////////////////////////////////////////////////////////////////////
function coreTranslate(dx, dy, dz) {

    var selectionMode = getSelectionMode();

    var selectedElement = getFirstSelectedWithoutAncestorInSelection();

    if (selectedElement == null) {
        return;
    }

    if (selectionMode == 0) {

        // object selection mode
        var translationTraitId = getTranslationTraitId();

        var t = selectedElement.getTrait(translationTraitId).value;

        var isSnapMode = getDesignerPropAsBool("snap");

        if (isSnapMode && stepAmount != 0) {
        
            var newX = t[0] + dx;
            var newY = t[1] + dy;
            var newZ = t[2] + dz;

            var tmpX = Math.round(newX / stepAmount) * stepAmount;
            var tmpY = Math.round(newY / stepAmount) * stepAmount;
            var tmpZ = Math.round(newZ / stepAmount) * stepAmount;

            var halfStep = stepAmount * 0.5;
            var stepPct = halfStep * 0.9;

            if (Math.abs(tmpX - newX) < stepPct) {
                t[0] = tmpX;
            }

            if (Math.abs(tmpY - newY) < stepPct) {
                t[1] = tmpY;
            }

            if (Math.abs(tmpZ - newZ) < stepPct) {
                t[2] = tmpZ;
            }
        }
        else {
            t[0] = t[0] + dx;
            t[1] = t[1] + dy;
            t[2] = t[2] + dz;
        }

        undoableItem._lastValue = t;
        undoableItem.onDo();
    }
    else if (selectionMode == 1 || selectionMode == 2 || selectionMode == 3) {

        // polygon or edge selection mode

        var pToL = getParentToLocal(selectedElement);
        var v = [dx, dy, dz];

        v = math.transformNormal(pToL, v);

        undoableItem._currentDelta[0] = v[0];
        undoableItem._currentDelta[1] = v[1];
        undoableItem._currentDelta[2] = v[2];

        undoableItem.onDo();
    }
}

///////////////////////////////////////////////////////////////////////////////
//
// Listens to manipulator position changes
//
///////////////////////////////////////////////////////////////////////////////
function onManipulatorXYZChangedHandler(sender, args) {

    var xyzDelta = manipulatorData.getTrait("ManipulatorTraitXYZ").value;
    var dx = xyzDelta[0];
    var dy = xyzDelta[1];
    var dz = xyzDelta[2];

    coreTranslate(dx, dy, dz);
}

///////////////////////////////////////////////////////////////////////////////
//
// Called when manipulator begins modifying the object (i.e. mouse down and begin drag)
// Begins the undoable block / marks the restore point
//
///////////////////////////////////////////////////////////////////////////////
function onBeginManipulation() {

    // services.debug.trace("Translate: onBeginManipulation()");    

    undoableItem = null;

    //
    // Check the selection mode
    //
    var selectionMode = getSelectionMode();
    if (selectionMode == 0) {
        //
        // object selection
        //

        // services.debug.trace("onBeginManipulation - object selection");

        var translationTraitId = getTranslationTraitId();

        function UndoableTranslation(trait, traitValues, initialValue) {
            this._traitArray = traitArray;
            this._traitValues = traitValues;
            this._initialValues = initialValue;
        }

        var traitArray = new Array();
        var traitValues = new Array();
        var initialValues = new Array();

        //
        // add the traits of selected items to the collections that we'll be operating on
        //
        var count = services.selection.count;
        for (i = 0; i < count; i++) {
            var currSelected = services.selection.getElement(i);

            //
            // don't operate on items whose parents (in scene) are ancestors
            // since this will double the amount of translation applied to those
            //
            var hasAncestor = false;
            for (var otherIndex = 0; otherIndex < count; otherIndex++) {
                if (otherIndex != i) {
                    var ancestor = services.selection.getElement(otherIndex);
                    if (currSelected.behavior.isAncestor(ancestor)) {
                        hasAncestor = true;
                        break;
                    }
                }
            }

            if (!hasAncestor) {

                var currTrait = currSelected.getTrait(translationTraitId);

                traitArray.push(currTrait);
                traitValues.push(currTrait.value);
                initialValues.push(currTrait.value);
            }
        }


        // create the undoable item
        undoableItem = new UndoableTranslation(traitArray, traitValues, initialValues);

        undoableItem.onDo = function () {

            var count = this._traitArray.length;

            // movement delta of all the selected is determined by delta of the first selected
            var delta = [0, 0, 0];
            if (count > 0) {
                delta[0] = this._lastValue[0] - this._initialValues[0][0];
                delta[1] = this._lastValue[1] - this._initialValues[0][1];
                delta[2] = this._lastValue[2] - this._initialValues[0][2];
            }

            for (i = 0; i < count; i++) {
                var currTrait = this._traitArray[i];
                this._traitValues[i][0] = this._initialValues[i][0] + delta[0];
                this._traitValues[i][1] = this._initialValues[i][1] + delta[1];
                this._traitValues[i][2] = this._initialValues[i][2] + delta[2];

                var theVal = this._traitArray[i].value;
                theVal[0] = this._traitValues[i][0];
                theVal[1] = this._traitValues[i][1];
                theVal[2] = this._traitValues[i][2];
                this._traitArray[i].value = theVal;
            }
        }

        undoableItem.onUndo = function () {
            var count = this._traitArray.length;
            for (i = 0; i < count; i++) {
                this._traitArray[i].value = this._initialValues[i];
            }
        }
    }
    else if (selectionMode == 1) {
        //
        // polygon selection mode
        //

        // services.debug.trace("onBeginManipulation - polygon selection");

        function UndoablePolyTranslation(elem) {
            // services.debug.trace("UndoablePolyTranslation construct");

            this._totalDelta = [0, 0, 0];
            this._currentDelta = [0, 0, 0];

            // find the mesh child
            this._meshElem = findFirstChildMesh(elem);
            if (this._meshElem == null) {
                return;
            }
            // services.debug.trace("UndoablePolyTranslation found mesh element");

            this._mesh = this._meshElem.behavior;

            // loop over the elements in the polygon collection
            var collElem = this._mesh.selectedObjects;
            if (collElem == null) {
                return;
            }

            this._polyCollectionElem = collElem.clone();

            // services.debug.trace("UndoablePolyTranslation found _polyCollectionElem element");

            // get the actual collection we can operate on
            this._polyCollection = this._polyCollectionElem.behavior;
            // services.debug.trace("assigned _polyCollection");

            this._geom = this._meshElem.getTrait("Geometry").value
        }

        //
        // do
        //
        UndoablePolyTranslation.prototype.onDo = function () {

            // array we will store indices in
            var polygonPoints = new Object();

            // loop over the point indices in the poly collection
            var polyCount = this._polyCollection.getPolygonCount();
            for (var i = 0; i < polyCount; i++) {
                var polyIndex = this._polyCollection.getPolygon(i);

                // get the point count and loop over polygon points
                var polygonPointCount = this._geom.getPolygonPointCount(polyIndex);
                for (var j = 0; j < polygonPointCount; j++) {

                    // get the point index
                    var pointIndex = this._geom.getPolygonPoint(polyIndex, j);
                    polygonPoints[pointIndex] = pointIndex;
                }
            }

            // loop over the unique set of indices and transform the associated point
            for (var key in polygonPoints) {
                var ptIdx = polygonPoints[key];
                var pt = this._geom.getPointAt(ptIdx);
                pt[0] += this._currentDelta[0];
                pt[1] += this._currentDelta[1];
                pt[2] += this._currentDelta[2];
                this._geom.setPointAt(ptIdx, pt);
            }

            this._totalDelta[0] += this._currentDelta[0];
            this._totalDelta[1] += this._currentDelta[1];
            this._totalDelta[2] += this._currentDelta[2];

            // invalidate the mesh collision
            this._mesh.recomputeCachedGeometry();
        }

        //
        // undo
        //
        UndoablePolyTranslation.prototype.onUndo = function () {

            // array we will store indices in
            var polygonPoints = new Object();

            // loop over the point indices in the poly collection
            var polyCount = this._polyCollection.getPolygonCount();
            for (var i = 0; i < polyCount; i++) {
                var polyIndex = this._polyCollection.getPolygon(i);

                // get the point count and loop over polygon points
                var polygonPointCount = this._geom.getPolygonPointCount(polyIndex);
                for (var j = 0; j < polygonPointCount; j++) {

                    // get the point index
                    var pointIndex = this._geom.getPolygonPoint(polyIndex, j);
                    polygonPoints[pointIndex] = pointIndex;
                }
            }

            // loop over the unique set of indices and transform the associated point
            for (var key in polygonPoints) {
                var ptIdx = polygonPoints[key];
                var pt = this._geom.getPointAt(ptIdx);
                pt[0] -= this._totalDelta[0];
                pt[1] -= this._totalDelta[1];
                pt[2] -= this._totalDelta[2];
                this._geom.setPointAt(ptIdx, pt);
            }

            this._currentDelta[0] = this._totalDelta[0];
            this._currentDelta[1] = this._totalDelta[1];
            this._currentDelta[2] = this._totalDelta[2];

            this._totalDelta[0] = 0;
            this._totalDelta[1] = 0;
            this._totalDelta[2] = 0;

            this._mesh.recomputeCachedGeometry();
        }

        // create the undoable item
        undoableItem = new UndoablePolyTranslation(document.selectedElement);
    }
    else if (selectionMode == 2) {
        //
        // edge selection
        //
        // services.debug.trace("onBeginManipulation - edge selection");

        function UndoableEdgeTranslation(elem) {
            // services.debug.trace("UndoableEdgeTranslation construct");

            this._totalDelta = [0, 0, 0];
            this._currentDelta = [0, 0, 0];

            // find the mesh child
            this._meshElem = findFirstChildMesh(elem);
            if (this._meshElem == null) {
                return;
            }
            // services.debug.trace("UndoableEdgeTranslation found mesh element");

            this._mesh = this._meshElem.behavior;

            // loop over the elements in the polygon collection
            var collElem = this._mesh.selectedObjects;
            if (collElem == null) {
                return;
            }

            this._collectionElem = collElem.clone();

            // services.debug.trace("UndoableEdgeTranslation found _collectionElem element");

            // get the actual collection we can operate on
            this._edgeCollection = this._collectionElem.behavior;
            // services.debug.trace("assigned _edgeCollection");

            this._geom = this._meshElem.getTrait("Geometry").value
        }

        //
        // do
        //
        UndoableEdgeTranslation.prototype.onDo = function () {

            // array we will store indices in
            var points = new Object();

            // loop over the edges
            var edgeCount = this._edgeCollection.getEdgeCount();
            for (var i = 0; i < edgeCount; i++) {
                var edge = this._edgeCollection.getEdge(i);

                points[edge[0]] = edge[0];
                points[edge[1]] = edge[1];
            }

            // loop over the unique set of indices and transform the associated point
            for (var key in points) {
                var ptIdx = points[key];
                var pt = this._geom.getPointAt(ptIdx);
                pt[0] += this._currentDelta[0];
                pt[1] += this._currentDelta[1];
                pt[2] += this._currentDelta[2];
                this._geom.setPointAt(ptIdx, pt);
            }

            this._totalDelta[0] += this._currentDelta[0];
            this._totalDelta[1] += this._currentDelta[1];
            this._totalDelta[2] += this._currentDelta[2];

            // invalidate the mesh collision
            this._mesh.recomputeCachedGeometry();
        }

        //
        // undo
        //
        UndoableEdgeTranslation.prototype.onUndo = function () {

            // array we will store indices in
            var points = new Object();

            // loop over the edges
            var edgeCount = this._edgeCollection.getEdgeCount();
            for (var i = 0; i < edgeCount; i++) {
                var edge = this._edgeCollection.getEdge(i);

                points[edge[0]] = edge[0];
                points[edge[1]] = edge[1];
            }

            // loop over the unique set of indices and transform the associated point
            for (var key in points) {
                var ptIdx = points[key];
                var pt = this._geom.getPointAt(ptIdx);
                pt[0] -= this._totalDelta[0];
                pt[1] -= this._totalDelta[1];
                pt[2] -= this._totalDelta[2];
                this._geom.setPointAt(ptIdx, pt);
            }

            this._currentDelta[0] = this._totalDelta[0];
            this._currentDelta[1] = this._totalDelta[1];
            this._currentDelta[2] = this._totalDelta[2];

            this._totalDelta[0] = 0;
            this._totalDelta[1] = 0;
            this._totalDelta[2] = 0;

            this._mesh.recomputeCachedGeometry();
        }

        // create the undoable item
        undoableItem = new UndoableEdgeTranslation(document.selectedElement);
    }
    else if (selectionMode == 3) {
        //
        // point selection
        //
        // services.debug.trace("onBeginManipulation - point selection");

        function UndoablePointTranslation(elem) {
            // services.debug.trace("UndoablePointTranslation construct");

            this._totalDelta = [0, 0, 0];
            this._currentDelta = [0, 0, 0];

            // find the mesh child
            this._meshElem = findFirstChildMesh(elem);
            if (this._meshElem == null) {
                return;
            }
            // services.debug.trace("UndoablePointTranslation found mesh element");

            this._mesh = this._meshElem.behavior;

            // loop over the elements in the polygon collection
            var collElem = this._mesh.selectedObjects;
            if (collElem == null) {
                return;
            }

            this._collectionElem = collElem.clone();

            // services.debug.trace("UndoablePointTranslation found _collectionElem element");

            // get the actual collection we can operate on
            this._pointCollection = this._collectionElem.behavior;
            // services.debug.trace("assigned _pointCollection");

            this._geom = this._meshElem.getTrait("Geometry").value
        }

        //
        // do
        //
        UndoablePointTranslation.prototype.onDo = function () {

            // array we will store indices in
            var points = new Object();

            // loop over the points
            var pointCount = this._pointCollection.getPointCount();
            for (var i = 0; i < pointCount; i++) {
                var pointIndex = this._pointCollection.getPoint(i);

                points[pointIndex] = pointIndex;
            }

            // loop over the unique set of indices and transform the associated point
            for (var key in points) {
                var ptIdx = points[key];
                var pt = this._geom.getPointAt(ptIdx);
                pt[0] += this._currentDelta[0];
                pt[1] += this._currentDelta[1];
                pt[2] += this._currentDelta[2];
                this._geom.setPointAt(ptIdx, pt);
            }

            this._totalDelta[0] += this._currentDelta[0];
            this._totalDelta[1] += this._currentDelta[1];
            this._totalDelta[2] += this._currentDelta[2];

            // invalidate the mesh collision
            this._mesh.recomputeCachedGeometry();
        }

        //
        // undo
        //
        UndoablePointTranslation.prototype.onUndo = function () {

            // array we will store indices in
            var points = new Object();

            // loop over the points
            var pointCount = this._pointCollection.getPointCount();
            for (var i = 0; i < pointCount; i++) {
                var pointIndex = this._pointCollection.getPoint(i);

                points[pointIndex] = pointIndex;
            }

            // loop over the unique set of indices and transform the associated point
            for (var key in points) {
                var ptIdx = points[key];
                var pt = this._geom.getPointAt(ptIdx);
                pt[0] -= this._totalDelta[0];
                pt[1] -= this._totalDelta[1];
                pt[2] -= this._totalDelta[2];
                this._geom.setPointAt(ptIdx, pt);
            }

            this._currentDelta[0] = this._totalDelta[0];
            this._currentDelta[1] = this._totalDelta[1];
            this._currentDelta[2] = this._totalDelta[2];

            this._totalDelta[0] = 0;
            this._totalDelta[1] = 0;
            this._totalDelta[2] = 0;

            this._mesh.recomputeCachedGeometry();
        }

        // create the undoable item
        undoableItem = new UndoablePointTranslation(document.selectedElement);
    }

    if (undoableItem != null) {
        undoableItem.getName = function () {
            var IDS_MreUndoTranslate = 143;
            return services.strings.getStringFromId(IDS_MreUndoTranslate);
        }
        services.undoService.addUndoableItem(undoableItem);
    }
}

///////////////////////////////////////////////////////////////////////////////
//
// onEndManipulation
//
///////////////////////////////////////////////////////////////////////////////
function onEndManipulation() {
}


///////////////////////////////////////////////////////////////////////////////
//
// Tool
//
///////////////////////////////////////////////////////////////////////////////
var tool = new Object();
// services.debug.trace("Translate: tool = new Object()");    

var onBeginManipulationHandler;
var onEndManipulationHandler;


///////////////////////////////////////////////////////////////////////////////
//
// Tool activate
//
///////////////////////////////////////////////////////////////////////////////
tool.activate = function () {
    // services.debug.trace("Translate: tool.activate()");    

    state.value = 2;

    createOptions();

    services.manipulators.activate("TranslationManipulator");

    onBeginManipulationHandler = manipulator.addHandler("OnBeginManipulation", onBeginManipulation);
    onEndManipulationHandler = manipulator.addHandler("OnEndManipulation", onEndManipulation);
    
    var mxyz = manipulatorData.getTrait("ManipulatorTraitXYZ");
    var ct = manipulatorData.getOrCreateTrait("cookie", "int", 0);
    ct.value = mxyz.addHandler("OnDataChanged", onManipulatorXYZChangedHandler);
}

///////////////////////////////////////////////////////////////////////////////
//
// Tool Deactive
//
///////////////////////////////////////////////////////////////////////////////
tool.deactivate = function () {
    // services.debug.trace("Translate: tool.deactivate()");    

    state.value = 0;

    var ct = manipulatorData.getTrait("cookie");
    manipulatorData.getTrait("ManipulatorTraitXYZ").removeHandler("OnDataChanged", ct.value);

    manipulator.removeHandler("OnBeginManipulation", onBeginManipulationHandler);
    manipulator.removeHandler("OnEndManipulation" , onEndManipulationHandler);

    services.manipulators.deactivate("TranslationManipulator");

    toolProps.getTrait("StepAmount").removeHandler("OnDataChanged", toolPropCookie);
    var snapTrait = document.designerProps.getOrCreateTrait("snap", "bool", 0);
    snapTrait.removeHandler("OnDataChanged", snapCookie);
}

///////////////////////////////////////////////////////////////////////////////
// Global code
///////////////////////////////////////////////////////////////////////////////

if (state.value != 2) {
    // services.debug.trace("Translate: setTool()");    
    document.setTool(tool);
}
// SIG // Begin signature block
// SIG // MIIoKwYJKoZIhvcNAQcCoIIoHDCCKBgCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 0eYuOxb6M7D6xewduFYfjBObsRakPS0tQ0eppdN49vOg
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
// SIG // a/15n8G9bW1qyVJzEw16UM0xghoNMIIaCQIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAE
// SIG // BGx0Bv9XKydyAAAAAAQEMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCD0DnWrsryU9PZPc8gvUSDj2VDSVGZZ6Jrn
// SIG // 137Mrc/CBjBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAEBSM9mk
// SIG // xBUfX6UOP32zSGTMVO4gVkh2lhJrle3R+09++oNpcNlx
// SIG // emcUNFOEzFYCzpPvjWff/Xga3Dl6a/r4noZt2Yq+iT7s
// SIG // sKD2ktreOFQpycwTE7zkedBY2cS50QRtaBK0gLe8DtJE
// SIG // 7KN68Z2dKJIFVSeblkdYMP1d05yCbIzH8Hw4MH6VPRqT
// SIG // wkjLlCHZaSZmwLaO/y79uqGz6zymlVt7GSgC9+MRmnpi
// SIG // vdlCIZAAlNz+i8U4PvZ0IQC1y2xqhmQZUv5y22m+/OAS
// SIG // n2ieS9/qGeYgytirMtut9LeGxZ5YoWBTzPf9vvuW79MY
// SIG // v0BR/NjohqDgeJ9p93IeI+ys2Z6hgheXMIIXkwYKKwYB
// SIG // BAGCNwMDATGCF4Mwghd/BgkqhkiG9w0BBwKgghdwMIIX
// SIG // bAIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUgYLKoZIhvcN
// SIG // AQkQAQSgggFBBIIBPTCCATkCAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgsiJMAaA4vodCfjMXCHMg
// SIG // TKlH8TcjY9iIjUDSf9cpAcUCBmf4P0OnXBgTMjAyNTA0
// SIG // MTUxOTM2MDUuMTU0WjAEgAIB9KCB0aSBzjCByzELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0
// SIG // IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UECxMeblNo
// SIG // aWVsZCBUU1MgRVNOOkUwMDItMDVFMC1EOTQ3MSUwIwYD
// SIG // VQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNl
// SIG // oIIR7TCCByAwggUIoAMCAQICEzMAAAILEZ1WKZL5v4UA
// SIG // AQAAAgswDQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwHhcNMjUwMTMwMTk0MjU4WhcN
// SIG // MjYwNDIyMTk0MjU4WjCByzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjElMCMGA1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3Bl
// SIG // cmF0aW9uczEnMCUGA1UECxMeblNoaWVsZCBUU1MgRVNO
// SIG // OkUwMDItMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG
// SIG // 9w0BAQEFAAOCAg8AMIICCgKCAgEAqqz4rUYwF6hYdiB8
// SIG // 0GA97spAz8iRfu/XuQpGOGmLG/d0Fbp+H2dybv9Fh67Q
// SIG // BdybMEogFZe6dR9sxSq78oWlbkWHEnO2Lsj9BhxFau2F
// SIG // Uubhd2C5S3qMhjjyklxrOmoFutAqlQYT0Ptp+PXumA/c
// SIG // Br+mNB5gSpp0KmPwCiYo4FIkbpW9aLzRHE2ZkzUbtZmP
// SIG // tCY4hLrPnheulTaAb9WtjFtCT2GxQYT8xR5XXRV3I39q
// SIG // iJG+QWFrBS+0JQY1wKX9h5jaz8xt+oNcm6Pyp0Y0oCEa
// SIG // R3mF8QSGghBrUdRJqSfdDkhR8VLu3iI1X3p6p1bWoNMg
// SIG // EGO8xFklzDevgh4790gTbZuWSEcsgrFGRvOOeCvvOuW8
// SIG // OxcLh/L5OUPtOyuZRWNNngQ8N1Cs1o1r6k6dqSvDE2uJ
// SIG // KM75SoK0hqebIeexp5I5bzb7e/DV22U1SK8Eu8XCBo27
// SIG // 0v9q+ZUQ0/kNz9rU/oOigz3S57ZXGxXR7rs8icsdFnwq
// SIG // /Mx7/MBggd6jzm0VyuKKQCJ0kOI+YktvCgEyRsEGm0bn
// SIG // mb4b3fTndMHBWDm+KK1L9XQ+V8BcipRgzzHEzzkK9IMZ
// SIG // hEFay4iRKC8slvBFf2gxVF06McoX81meg3NJfXnrYdRL
// SIG // djUNwP6gUecd96YynRyVSecaadgCN2czWCwwqjtZbYc9
// SIG // Rmks/j0CAwEAAaOCAUkwggFFMB0GA1UdDgQWBBRmXCyI
// SIG // 36/pelnjLoRPYLMXvfI//jAfBgNVHSMEGDAWgBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQ
// SIG // hk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENB
// SIG // JTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwG
// SIG // CCsGAQUFBzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUt
// SIG // U3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMB
// SIG // Af8EAjAAMBYGA1UdJQEB/wQMMAoGCCsGAQUFBwMIMA4G
// SIG // A1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // mij1Z+hi3J5GzxHTNEfauGZtPuyXxtOfqZqj+pwOEsE9
// SIG // upPR5SUI6sP/lpIkCw+KMCcaKCK/TA2W4mV+sqT4RfoN
// SIG // T+bvAThFz2GJDlqcxRi0S7ZWR738aagCGu5oyxhw8yq/
// SIG // 9dNgF2g+JhsnRMGixoVJ/QwRnTJuXYYorFgKm/yzeJZu
// SIG // Drl+GC6inFv9MknByoKaxoC2Puqar9Mz1O+I+3gq/jw0
// SIG // zWDPLRSf27VJwTS8jhOFmcASKuLZ7143dnAjrYFJ6EIx
// SIG // VNWWO2VnZ8twSW394Qa29zQdiFOJ7uttrVa29XzZMHb0
// SIG // +dNVkVATHfaBX+MYn49o9gpW79VxpY15nesiY77fmwbr
// SIG // yS1LnPZvrzCjlskcFHbzpfxOWvM1dzK4wp2OnyKy0Dcw
// SIG // TmepJSAjwovthqm1YjNAiOgm2cqXouUa/YSWx/K2RM42
// SIG // mFi56/1z7FNMK9k5+i/XScdqvywKCvqL4gCJ49Gj+Ika
// SIG // zMlEjuii9isGOsyXOkg8Wx5MGB3UEazzT90rrTIOi4AU
// SIG // r7Zn6sIGlyB5AqIlBRAM/XBiKr4IxqRqaSk3E7qKNxBI
// SIG // Kf80XdMMVtEKpld8oGBonHp99CgFh6yhQvEm8HOqguKa
// SIG // HVWWCWZoqxwT/7qO7EJ3uR9MbXbw5lw1H8uYDYy5Y0CF
// SIG // LCYUEssl20o0m9muY4TlH8cwggdxMIIFWaADAgECAhMz
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
// SIG // ahC0HVUzWLOhcGbyoYIDUDCCAjgCAQEwgfmhgdGkgc4w
// SIG // gcsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJTAjBgNVBAsTHE1p
// SIG // Y3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlvbnMxJzAlBgNV
// SIG // BAsTHm5TaGllbGQgVFNTIEVTTjpFMDAyLTA1RTAtRDk0
// SIG // NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUAqEJ3VCTdz6at
// SIG // sYfEYbbEd+TQmcGggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQsFAAIFAOuo
// SIG // rCYwIhgPMjAyNTA0MTUwOTU3NThaGA8yMDI1MDQxNjA5
// SIG // NTc1OFowdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA66is
// SIG // JgIBADAKAgEAAgIR9gIB/zAHAgEAAgISVDAKAgUA66n9
// SIG // pgIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBCwUAA4IBAQBAGlE+NOwGbjoYXpFNHwDr/6fO
// SIG // 7iai7/MUWRqfLQWKUhELT7Uv3ae37Pp9tWwx1g/BB6Su
// SIG // 2xhg9bXHKrUMdzmZStfkNVx4eIWGKcmIz8JKf+aGcH+x
// SIG // aP9MnsYZca6l2v+nx74/Fij3+Hi65IbpH88/FgS+5eqP
// SIG // 6/DBrIhyLlJrcKoLXwKVqyjaxSwNKsYY+HZEJuFootDs
// SIG // 6pqlV+UwQQSxFVvD89TVKJN1+3YPHlFhf+Z2iQm9+xjD
// SIG // o/i1IgGwvz2HAoyyAD5W+Ai4sS/KDFx9gNZwuWaZUTki
// SIG // 0W85egBbUmuXQVuuIxRnKSAiWScApZAAIJRUUlOAX5va
// SIG // pZoMNvJIMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAILEZ1WKZL5v4UAAQAA
// SIG // AgswDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3DQEJ
// SIG // AzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQxIgQg
// SIG // 89Nlq5O5M34g523CfgVXyMuYlOvZSfMWoDSwW6jzSIUw
// SIG // gfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCA01XSr
// SIG // uje+24dMHTshfqIETfLyiXMOY539vxLrLGJKMzCBmDCB
// SIG // gKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMz
// SIG // AAACCxGdVimS+b+FAAEAAAILMCIEIFYFKlyycWfJnlXF
// SIG // GvaFTIfi8NqFi5295NOrOdnelZsCMA0GCSqGSIb3DQEB
// SIG // CwUABIICAAQmSARxS0ABGl2Vkl1IIjtyPHHSPt7jXcNO
// SIG // 9xXOcPxIPVEgXqec0AVyf8IkeQ0YjSSLsHaBQbUn88R9
// SIG // ZZXDr34Fl0xVBFzMzJ2YOq1nmrqcplMSBLcseGErNYEj
// SIG // etVsmLni1E7JIWfS0Hhbm9hl5IUoSpGOCMhr3EbB85gW
// SIG // XwUZdIWQMOv8OnbSii+AtNq2ws+BkMz8zIrItkbrFskJ
// SIG // /jRGzM+ULUZ2MxZNLZwm6tx+160G9CakWG2I7Kz+MZch
// SIG // NhWdSJ3Hk//SJt1B6sl9VV9AkmHFBxwxP6hL8KXQkZF3
// SIG // 5DDvxgFvCfZNLMBX19gkA3+6qmvNSTsOIwC98cOssi06
// SIG // pEj1aks3nb6TJm9MuNwHWN4kkZVsQHOubD4KzgrvYJS/
// SIG // iCeSnzNojTDMCpGr3wgV+oxMXYMeZ3Nx44e3Prtb4Rk7
// SIG // znnLmXcoHCNHSWzNpbjlzYsqlhQa2a/MczQrFLJe2DS4
// SIG // vQFCuugF40WMhh2Ph3JLjUpaedIC4qE7gzjrrbmMWU69
// SIG // C+TuL4Jy6477AF+s4MVz2dBSne2m4duNRz16E2ZYnR4t
// SIG // kdtnZx+MptyRT/0yocpWoRWyyvhj916u551gc6K1XFNz
// SIG // EER8lxAlWShq+3nD7LWY4Ts8mWFFQojSJaH+1IRf8j+U
// SIG // bHPniSzXneL0PxKObmz4x9UUCVFlpNgw
// SIG // End signature block
