// 
// Copyright (C) Microsoft. All rights reserved.
//
define("DataUtilities", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DataUtilities = void 0;
    /* A helper class to get graph data from the analyzer.
     */
    class DataUtilities {
        static getFilteredResult(dataWarehouse, analyzerId, counterId, timespan, customData) {
            var contextData = {
                timeDomain: timespan,
                customDomain: {
                    CounterId: counterId
                }
            };
            if (customData) {
                for (var key in customData) {
                    if (customData.hasOwnProperty(key)) {
                        contextData.customDomain[key] = customData[key];
                    }
                }
            }
            return dataWarehouse.getFilteredData(contextData, analyzerId);
        }
    }
    exports.DataUtilities = DataUtilities;
});
// 
// Copyright (C) Microsoft. All rights reserved.
//
define("GraphResources", ["require", "exports", "plugin-vs-v2"], function (require, exports, Plugin) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GraphResources = void 0;
    /* A helper class to get the resource string either from the hub resource dictionary or from Plugin.
     */
    class GraphResources {
        constructor(resources) {
            this._graphResources = resources;
        }
        getString(resourceId, ...args) {
            // First try to get the resource from the dictionary
            if (this._graphResources) {
                var resourceString = this._graphResources[resourceId];
                if (resourceString !== undefined) {
                    resourceString = GraphResources.format(resourceId, resourceString, args);
                    return resourceString;
                }
            }
            // Fallback to the Microsoft.Plugin resources
            try {
                return Plugin.Resources.getString.apply(Plugin.Resources, arguments);
            }
            catch (e) { }
            return resourceId;
        }
        static format(resourceId, format, args) {
            return format.replace(GraphResources.FORMAT_REG_EXP, (match, index) => {
                var replacer;
                switch (match) {
                    case "{{":
                        replacer = "{";
                        break;
                    case "}}":
                        replacer = "}";
                        break;
                    case "{":
                    case "}":
                        throw new Error(Plugin.Resources.getErrorString("JSPlugin.3002"));
                    default:
                        var argsIndex = parseInt(index);
                        if (args && argsIndex < args.length) {
                            replacer = args[argsIndex].toString();
                        }
                        else {
                            throw new Error(Plugin.Resources.getErrorString("JSPlugin.3003") + " (resourceId = " + resourceId + ")");
                        }
                        break;
                }
                if (replacer === undefined || replacer === null) {
                    replacer = "";
                }
                return replacer;
            });
        }
    }
    exports.GraphResources = GraphResources;
    GraphResources.FORMAT_REG_EXP = /\{{2}|\{(\d+)\}|\}{2}|\{|\}/g;
});
//
// Copyright (C) Microsoft. All rights reserved.
//
// Expose our AMD swimlane module to the global object
window.define("hubGraphs", ["StackedBarGraph"], (factoryModule) => {
    window.VisualProfiler = {
        Graphs: {
            StackedBarGraph: factoryModule.StackedBarGraph
        }
    };
});
// 
// Copyright (C) Microsoft. All rights reserved.
//
define("StackedBarChart", ["require", "exports", "plugin-vs-v2", "diagnosticsHub-swimlanes", "diagnosticsHub"], function (require, exports, Plugin, DiagnosticsHubSwimlanes, diagnosticsHub_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StackedBarChartView = exports.StackedBarChartPresenter = exports.DataSeriesInfo = void 0;
    class DataSeriesInfo {
        constructor(name, cssClass, sortOrder) {
            if (!name || sortOrder === undefined || sortOrder === null) {
                throw new Error(Plugin.Resources.getErrorString("JSPerf.1044"));
            }
            this._name = name;
            this._cssClass = cssClass;
            this._sortOrder = sortOrder;
        }
        get cssClass() {
            return this._cssClass;
        }
        get name() {
            return this._name;
        }
        get sortOrder() {
            return this._sortOrder;
        }
    }
    exports.DataSeriesInfo = DataSeriesInfo;
    class StackedBarChartPresenter {
        constructor(options) {
            this._data = [];
            this._dataSeriesInfo = {};
            this._maximumYValue = Number.NEGATIVE_INFINITY;
            this.viewModel = [];
            this._options = options;
            this.validateOptions();
            this._pixelHorizontalValue = this.xWidth / this._options.width;
        }
        get maximumYValue() {
            return this._maximumYValue;
        }
        get xWidth() {
            return this._options.maxX - this._options.minX;
        }
        addData(chartData) {
            chartData.forEach((dataItem) => {
                if (this._dataSeriesInfo.hasOwnProperty(dataItem.series)) {
                    this._data.push(dataItem);
                }
                else {
                    throw new Error(Plugin.Resources.getErrorString("JSPerf.1043"));
                }
            });
            this.generateViewModel();
        }
        addSeries(seriesInfo) {
            for (var i = 0; i < seriesInfo.length; i++) {
                var info = seriesInfo[i];
                if (this._dataSeriesInfo.hasOwnProperty(info.name)) {
                    throw new Error(Plugin.Resources.getErrorString("JSPerf.1045"));
                }
                this._dataSeriesInfo[info.name] = info;
            }
        }
        getViewOptions() {
            var viewOptions = {
                ariaDescription: this._options.ariaDescription,
                ariaLabelCallback: this._options.ariaLabelCallback,
                height: this._options.height,
                width: this._options.width,
                tooltipCallback: this._options.tooltipCallback,
                legendData: this._dataSeriesInfo
            };
            return viewOptions;
        }
        determineYAxisScale(allBars) {
            this.log("_maximumYValue (164) = " + this._maximumYValue);
            for (var i = 0; i < allBars.length; i++) {
                var totalStackHeight = 0;
                var currentBar = allBars[i];
                for (var j = 0; j < currentBar.length; j++) {
                    var stackComponent = currentBar[j];
                    if (stackComponent.height > 0) {
                        totalStackHeight += stackComponent.height;
                    }
                }
                this.log("\t" + i + " = " + totalStackHeight);
                this._maximumYValue = Math.max(this._maximumYValue, totalStackHeight);
            }
            this.log("_maximumYValue (179) = " + this._maximumYValue);
            this._maximumYValue = Math.max(this._options.minYHeight, this._maximumYValue);
            this.log("_maximumYValue (184) = " + this._maximumYValue);
            // Round the max value to the next 100, taking into account real precision (to avoid scaling up by 100 to cater
            // for the 100.0000000001 case)
            this._maximumYValue = Math.ceil(Math.floor(this._maximumYValue) / 100) * 100;
            this.log("_maximumYValue (190) = " + this._maximumYValue);
            var availableAxisHight = this._options.height - StackedBarChartPresenter.YAXIS_PIXEL_PADDING;
            this.log("availableAxisHight   = " + availableAxisHight);
            if (availableAxisHight <= 0) {
                availableAxisHight = this._options.height;
            }
            this._pixelVerticalValue = this._maximumYValue / availableAxisHight;
            this.log("_maximumYValue (199) = " + this._maximumYValue);
            this.log("availableAxisHight   = " + availableAxisHight);
            this.log("_pixelVerticalValue  = " + this._pixelVerticalValue);
            this._maximumYValue = this._options.height * this._pixelVerticalValue;
            this.log("_maximumYValue (205) = " + this._maximumYValue);
        }
        generateViewModel() {
            var allBars = [[]];
            var singleBar = [];
            var barWidthAndMargin = this._options.barWidth + this._options.barGap;
            var currentXValue = this._options.minX;
            var prevValue = Number.NEGATIVE_INFINITY;
            var x = 0;
            var i = 0;
            while (i < this._data.length) {
                var dataItem = this._data[i];
                if (dataItem.x < prevValue) {
                    throw new Error(Plugin.Resources.getErrorString("JSPerf.1046"));
                }
                if (dataItem.x > this._options.maxX) {
                    break;
                }
                prevValue = dataItem.x;
                var currentXValue = Math.floor(x * this._pixelHorizontalValue + this._options.minX);
                var currentBarMinValue = currentXValue;
                var currentBarMaxValue = currentXValue + Math.floor((this._options.barWidth + this._options.barGap) * this._pixelHorizontalValue);
                if (dataItem.x < currentBarMinValue) {
                    i++;
                    continue;
                }
                if (dataItem.x < currentBarMaxValue) {
                    dataItem.x = x;
                    singleBar.push(dataItem);
                    i++;
                }
                else {
                    allBars.push(singleBar);
                    singleBar = [];
                    x += barWidthAndMargin;
                }
            }
            allBars.push(singleBar);
            this.determineYAxisScale(allBars);
            this.log("Generating view models for single stacks.");
            this.log("");
            for (var i = 0; i < allBars.length; i++) {
                this.log("Bar # " + i);
                this.generateViewModelForSingleStack(allBars[i]);
                this.log("");
            }
        }
        generateViewModelForSingleStack(dataItems) {
            if (!dataItems || dataItems.length === 0) {
                return;
            }
            dataItems.sort(this.sortBySeries.bind(this));
            var accumulatedHeight = 2 * StackedBarChartPresenter.EDGE_LINE_THICKNESS;
            var maxHeightExceeded = false;
            for (var i = dataItems.length - 1; i >= 0; i--) {
                var dataItem = dataItems[i];
                this.log("\t" + i + ": " + dataItem.series + " = " + dataItem.height + "(" + dataItem.x + ")");
                if (dataItem.height <= 0) {
                    continue;
                }
                var barHeight = Math.round(dataItem.height / this._pixelVerticalValue);
                this.log("\t\tbarHeight = " + barHeight);
                if (barHeight < StackedBarChartPresenter.MIN_BAR_HEIGHT) {
                    this.log("\t\t\t- barHeigh too small. Resetting to " + StackedBarChartPresenter.MIN_BAR_HEIGHT);
                    barHeight = StackedBarChartPresenter.MIN_BAR_HEIGHT;
                }
                var startY = this._options.height - (barHeight + accumulatedHeight);
                this.log("\t\t\t- startY = " + startY);
                if (startY < StackedBarChartPresenter.YAXIS_PIXEL_PADDING) {
                    barHeight = Math.max(100 * this._pixelVerticalValue - accumulatedHeight, StackedBarChartPresenter.MIN_BAR_HEIGHT);
                    startY = StackedBarChartPresenter.YAXIS_PIXEL_PADDING;
                    this.log("\t\t\t- startY is too small. Resetting to " + startY + " and barHeight to " + barHeight);
                    maxHeightExceeded = true;
                }
                accumulatedHeight += barHeight;
                if (this._options.showStackGap) {
                    accumulatedHeight += this._options.barGap;
                }
                var rectangle = {
                    x: dataItem.x,
                    y: startY,
                    height: barHeight,
                    width: this._options.barWidth,
                    className: this._dataSeriesInfo[dataItem.series].cssClass,
                    chartItem: dataItem
                };
                this.viewModel.push(rectangle);
                if (maxHeightExceeded) {
                    break;
                }
            }
        }
        sortBySeries(chartItem1, chartItem2) {
            return this._dataSeriesInfo[chartItem2.series].sortOrder - this._dataSeriesInfo[chartItem1.series].sortOrder;
        }
        validateOptions() {
            if (!this._options) {
                throw new Error(Plugin.Resources.getErrorString("JSPerf.1047"));
            }
            if ((this._options.minX === undefined || this._options.minX === null) ||
                (this._options.maxX === undefined || this._options.maxX === null) ||
                (this._options.minY === undefined || this._options.minY === null) ||
                (this._options.minX > this._options.maxX) ||
                (!this._options.height || !this._options.width || this._options.height < 0 || this._options.width < 0) ||
                (!this._options.barWidth || this._options.barWidth < 0)) {
                throw new Error(Plugin.Resources.getErrorString("JSPerf.1048"));
            }
            this._options.barGap = this._options.barGap || 1;
            this._options.showStackGap = this._options.showStackGap || true;
            this._options.minYHeight = this._options.minYHeight || this._options.minY;
        }
        static get logger() {
            if (!StackedBarChartPresenter._logger) {
                StackedBarChartPresenter._logger = diagnosticsHub_1.getLogger();
            }
            return StackedBarChartPresenter._logger;
        }
        log(message) {
            StackedBarChartPresenter.logger.debug(StackedBarChartPresenter.LoggerPrefixText + message);
        }
    }
    exports.StackedBarChartPresenter = StackedBarChartPresenter;
    StackedBarChartPresenter.LoggerPrefixText = "StackedBarChartPresenter: ";
    StackedBarChartPresenter.EDGE_LINE_THICKNESS = 1;
    StackedBarChartPresenter.YAXIS_PIXEL_PADDING = 10 + 2 * StackedBarChartPresenter.EDGE_LINE_THICKNESS;
    StackedBarChartPresenter.MIN_BAR_HEIGHT = 2;
    class StackedBarChartView {
        constructor() {
            this._idCount = 0;
            this._selectedId = -1;
            this.rootElement = document.createElement("div");
            this.rootElement.style.width = this.rootElement.style.height = "100%";
        }
        set presenter(value) {
            this._presenter = value;
            this._viewData = this._presenter.viewModel;
            this._options = value.getViewOptions();
            this._barGraphWidth = this._options.width;
            this.drawChart();
        }
        createContainer() {
            if (!this._chartAreaContainer) {
                this._chartAreaContainer = document.createElement("div");
                this.rootElement.appendChild(this._chartAreaContainer);
            }
            else {
                this._chartAreaContainer.innerHTML = "";
            }
            this._chartAreaContainer.style.width = this._options.width + "px";
            this._chartAreaContainer.style.height = this._options.height + "px";
            this._chartAreaContainer.classList.add("stackedBarChart");
            this._chartAreaContainer.style.display = "-ms-grid";
        }
        createRect(x, y, height, width, className) {
            var rect = document.createElement("div");
            rect.id = StackedBarChartView._barIdPrefix + this._idCount;
            rect.tabIndex = -1;
            this._idCount++;
            rect.classList.add("bar");
            rect.classList.add(className);
            rect.style.left = x + "px";
            rect.style.bottom = (this._options.height - y - height) + "px";
            rect.style.height = height + "px";
            rect.style.width = width + "px";
            return rect;
        }
        drawChart() {
            if (!this._viewData) {
                throw new Error(Plugin.Resources.getErrorString("JSPerf.1049"));
            }
            this.createContainer();
            this.initializeBarGraph();
            this.renderViewData(this._barGraph, this._viewData);
            this._chartAreaContainer.appendChild(this._barGraph);
        }
        initializeBarGraph() {
            this._selectedId = -1;
            this._idCount = 0;
            this._barGraph = document.createElement("div");
            this._barGraph.classList.add("barGraph");
            this._barGraph.tabIndex = 0;
            this._barGraph.style.height = this._options.height + "px";
            this._barGraph.style.width = this._barGraphWidth + "px";
            this._barGraph.addEventListener("keydown", this.onBarGraphKeydown.bind(this));
            this._barGraph.addEventListener("focus", () => { this._selectedId = -1; });
            if (this._options.ariaDescription) {
                this._barGraph.setAttribute("aria-label", this._options.ariaDescription);
            }
        }
        onBarBlur(event) {
            var bar = event.currentTarget;
            bar.classList.remove("focused");
            Plugin.Tooltip.dismiss();
        }
        onBarFocus(chartItem, event) {
            var bar = event.currentTarget;
            bar.classList.add("focused");
            if (this._options.ariaLabelCallback) {
                var ariaLabel = this._options.ariaLabelCallback(chartItem);
                bar.setAttribute("aria-label", ariaLabel);
            }
            var element = event.currentTarget;
            var offsetX = window.screenLeft + element.offsetLeft + element.clientWidth;
            var offsetY = window.screenTop + element.offsetTop + element.clientHeight;
            this.showTooltip(chartItem, offsetX, offsetY);
        }
        onBarGraphKeydown(event) {
            if (event.keyCode === DiagnosticsHubSwimlanes.KeyCodes.ArrowLeft || event.keyCode === DiagnosticsHubSwimlanes.KeyCodes.ArrowRight) {
                if (event.keyCode === DiagnosticsHubSwimlanes.KeyCodes.ArrowLeft) {
                    if ((this._selectedId === 0) || (this._selectedId === -1)) {
                        this._selectedId = this._idCount;
                    }
                    this._selectedId--;
                }
                else if (event.keyCode === DiagnosticsHubSwimlanes.KeyCodes.ArrowRight) {
                    this._selectedId++;
                    if (this._selectedId === this._idCount) {
                        this._selectedId = 0;
                    }
                }
                var bar = document.getElementById(StackedBarChartView._barIdPrefix + this._selectedId);
                bar.focus();
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
            return true;
        }
        renderViewData(container, viewData) {
            for (var i = 0; i < viewData.length; i++) {
                var barInfo = viewData[i];
                var rectangle = this.createRect(barInfo.x, barInfo.y, barInfo.height, barInfo.width, barInfo.className);
                rectangle.addEventListener("mouseover", this.showTooltip.bind(this, barInfo.chartItem));
                rectangle.addEventListener("mouseout", () => Plugin.Tooltip.dismiss());
                rectangle.addEventListener("focus", this.onBarFocus.bind(this, barInfo.chartItem));
                rectangle.addEventListener("blur", this.onBarBlur.bind(this));
                container.appendChild(rectangle);
            }
        }
        showTooltip(chartItem, x, y) {
            if (this._options.tooltipCallback) {
                var toolTipContent = this._options.tooltipCallback(chartItem);
                var config = { content: toolTipContent, delay: 0, x: x, y: y, contentContainsHTML: true };
                Plugin.Tooltip.show(config);
            }
        }
    }
    exports.StackedBarChartView = StackedBarChartView;
    StackedBarChartView._barIdPrefix = "bar";
});
// 
// Copyright (C) Microsoft. All rights reserved.
//
define("StackedBarGraph", ["require", "exports", "plugin-vs-v2", "diagnosticsHub", "diagnosticsHub-swimlanes", "StackedBarChart", "GraphResources", "DataUtilities"], function (require, exports, Plugin, DiagnosticsHub, DiagnosticsHubSwimlanes, StackedBarChart_1, GraphResources_1, DataUtilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StackedBarGraph = exports.Category = void 0;
    class Category {
    }
    exports.Category = Category;
    Category.parsingCategory = "Parsing_Category";
    Category.layoutCategory = "Layout_Category";
    Category.appCodeCategory = "AppCode_Category";
    Category.xamlOtherCategory = "XamlOther_Category";
    Category.renderCategory = "Render_Category";
    Category.ioCategory = "IO_Category";
    class StackedBarGraph {
        constructor(config) {
            this._scaleChangedEvent = new DiagnosticsHub.AggregatedEvent();
            this._config = config;
            this._graphResources = new GraphResources_1.GraphResources(this._config.resources);
            this._timeRange = this._config.timeRange || new DiagnosticsHub.JsonTimespan(new DiagnosticsHub.BigNumber(0, 0), new DiagnosticsHub.BigNumber(0, 0));
            this._container = document.createElement("div");
            StackedBarGraph.validateConfiguration(this._config);
            this._dataSource = this._config.jsonConfig.Series[0].DataSource;
            if (config.pathToScriptFolder && config.loadCss) {
                config.loadCss(config.pathToScriptFolder + "/CSS/hubGraphs/StackedBarChart.css");
                config.loadCss(config.pathToScriptFolder + "/DataCategoryStyles.css");
            }
            // Setup scale
            this._config.scale = this._config.scale || {};
            this._config.scale.minimum = 0;
            this._config.scale.maximum = 120;
            this._config.scale.axes = [];
            this._config.scale.axes.push({
                value: 100
            });
            // add series and legend to config
            this._config.legend = this._config.legend || [];
            var seriesCollection = this._config.jsonConfig.Series;
            for (var i = 0; i < seriesCollection.length; i++) {
                var series = seriesCollection[i];
                this._config.legend.push({
                    color: series.Color,
                    legendText: this._graphResources.getString(series.Legend),
                    legendTooltip: (series.LegendTooltip ? this._graphResources.getString(series.LegendTooltip) : null)
                });
            }
        }
        get container() {
            return this._container;
        }
        get scaleChangedEvent() {
            return this._scaleChangedEvent;
        }
        get containerOffsetWidth() {
            if (this._containerOffsetWidth === undefined) {
                this._containerOffsetWidth = this._container.offsetWidth;
            }
            return this._containerOffsetWidth;
        }
        onDataUpdate(timestampNs) {
            // Not implemented
        }
        addSeriesData(counterId, points, fullRender, dropOldData) {
            // Not implemented
        }
        getDataPresenter() {
            var presenterOptions = {
                ariaDescription: this._graphResources.getString("UiThreadActivityAriaLabel"),
                height: this._config.height,
                width: this.containerOffsetWidth,
                minX: parseInt(this._timeRange.begin.value),
                maxX: parseInt(this._timeRange.end.value),
                minY: 0,
                minYHeight: 100,
                barWidth: this._config.jsonConfig.BarWidth,
                barGap: this._config.jsonConfig.BarGap,
                showStackGap: this._config.jsonConfig.ShowStackGap,
                tooltipCallback: this.createTooltip.bind(this),
                ariaLabelCallback: this.createAriaLabel.bind(this)
            };
            var presenter = new StackedBarChart_1.StackedBarChartPresenter(presenterOptions);
            //
            // Add series information to the presenter
            //
            var dataSeriesInfo = [];
            var stackedDataSeries = this._config.jsonConfig.Series;
            for (var i = 0; i < stackedDataSeries.length; i++) {
                var seriesItem = stackedDataSeries[i];
                dataSeriesInfo.push({
                    cssClass: seriesItem.CssClass,
                    name: seriesItem.Category,
                    sortOrder: i + 1
                });
            }
            presenter.addSeries(dataSeriesInfo);
            return presenter;
        }
        getGranularity() {
            var bucketWidth = this._config.jsonConfig.BarGap + this._config.jsonConfig.BarWidth;
            var graphDuration = parseInt(this._timeRange.elapsed.value);
            if (graphDuration <= 0 || this.containerOffsetWidth <= 0) {
                return 0;
            }
            return Math.floor(bucketWidth / this.containerOffsetWidth * graphDuration);
        }
        removeInvalidPoints(base) {
            // Not implemented
        }
        render(fullRender) {
            if (this._config.jsonConfig.GraphBehaviour == DiagnosticsHubSwimlanes.GraphBehaviourType.PostMortem) {
                this.setData(this._timeRange);
            }
        }
        resize(evt) {
            this._containerOffsetWidth = undefined;
            this.render();
        }
        onViewportChanged(viewportArgs) {
            if (this._timeRange.equals(viewportArgs.currentTimespan)) {
                // Only selection changed, ignore this event
                return;
            }
            this._timeRange = viewportArgs.currentTimespan;
            this.render();
        }
        static validateConfiguration(config) {
            if (!config) {
                throw new Error(Plugin.Resources.getErrorString("JSPerf.1070"));
            }
            var jsonObject = config.jsonConfig;
            if (!jsonObject) {
                throw new Error(Plugin.Resources.getErrorString("JSPerf.1071"));
            }
            if (!jsonObject.Series || jsonObject.Series.length === 0) {
                throw new Error(Plugin.Resources.getErrorString("JSPerf.1072"));
            }
            jsonObject.BarWidth = jsonObject.BarWidth || 16;
            jsonObject.BarGap = jsonObject.BarGap || 1;
            jsonObject.ShowStackGap = jsonObject.ShowStackGap || true;
            if ((!config.height || config.height < 0) ||
                jsonObject.BarWidth < 0) {
                throw new Error(Plugin.Resources.getErrorString("JSPerf.1048"));
            }
        }
        createTooltip(cpuUsage) {
            var tooltip = this._graphResources.getString(cpuUsage.series) + ": " + (Math.round(cpuUsage.height * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) + "%";
            return tooltip;
        }
        createAriaLabel(cpuUsage) {
            var percentageUtilization = (Math.round(cpuUsage.height * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
            var formattedTime = DiagnosticsHubSwimlanes.RulerUtilities.formatTime(DiagnosticsHub.BigNumber.convertFromNumber(cpuUsage.x), DiagnosticsHubSwimlanes.UnitFormat.fullName);
            return this._graphResources.getString("UiThreadActivityBarAriaLabel", this._graphResources.getString(cpuUsage.series), percentageUtilization, formattedTime);
        }
        static jsonTimeToNanoseconds(bigNumber) {
            var l = bigNumber.l;
            var h = bigNumber.h;
            if (l < 0) {
                l = l >>> 0;
            }
            if (h < 0) {
                h = h >>> 0;
            }
            var nsec = h * 0x100000000 + l;
            return nsec;
        }
        setData(timeRange) {
            if (this._settingDataPromise) {
                // TODO: Implement promise cancellation.
                // this._settingDataPromise.cancel();
                // this._settingDataPromise = null;
            }
            if (!this._dataSource || !this._dataSource.CounterId || !this._dataSource.AnalyzerId) {
                // No data to set if there is no data source
                return;
            }
            this._settingDataPromise = this.getDataWarehouse().then((dataWarehouse) => {
                var granuality = this.getGranularity();
                if (granuality > 0) {
                    return DataUtilities_1.DataUtilities.getFilteredResult(dataWarehouse, this._dataSource.AnalyzerId, this._dataSource.CounterId, timeRange, {
                        granularity: granuality.toString(),
                        task: "1" // AnalysisTaskType::GetUIThreadActivityData in XamlProfiler\DataModel\XamlAnalyzer.h
                    });
                }
                else {
                    return Promise.resolve([]);
                }
            }).then((cpuUsageResult) => {
                if (this._chart) {
                    this._container.removeChild(this._chart.rootElement);
                    this._chart = null;
                }
                if (cpuUsageResult) {
                    var chartItems = [];
                    for (var i = 0; i < cpuUsageResult.length; i++) {
                        var cpuUsagePoint = cpuUsageResult[i];
                        var parsingTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.ParsingTime);
                        var layoutTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.LayoutTime);
                        var appCodeTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.AppCodeTime);
                        var xamlOtherTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.XamlOther);
                        var renderTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.RenderTime);
                        var ioTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.IOTime);
                        var startTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.StartTime);
                        var endTime = StackedBarGraph.jsonTimeToNanoseconds(cpuUsagePoint.EndTime);
                        var totalTime = endTime - startTime;
                        if (parsingTime > 0) {
                            chartItems.push({
                                series: Category.parsingCategory,
                                x: startTime,
                                height: parsingTime * 100.0 / totalTime
                            });
                        }
                        if (layoutTime > 0) {
                            chartItems.push({
                                series: Category.layoutCategory,
                                x: startTime,
                                height: layoutTime * 100.0 / totalTime
                            });
                        }
                        if (appCodeTime > 0) {
                            chartItems.push({
                                series: Category.appCodeCategory,
                                x: startTime,
                                height: appCodeTime * 100.0 / totalTime
                            });
                        }
                        if (xamlOtherTime > 0) {
                            chartItems.push({
                                series: Category.xamlOtherCategory,
                                x: startTime,
                                height: xamlOtherTime * 100.0 / totalTime
                            });
                        }
                        if (renderTime > 0) {
                            chartItems.push({
                                series: Category.renderCategory,
                                x: startTime,
                                height: renderTime * 100.0 / totalTime
                            });
                        }
                        if (ioTime > 0) {
                            chartItems.push({
                                series: Category.ioCategory,
                                x: startTime,
                                height: ioTime * 100.0 / totalTime
                            });
                        }
                    }
                    var dataPresenter = this.getDataPresenter();
                    dataPresenter.addData(chartItems);
                    this._chart = new StackedBarChart_1.StackedBarChartView();
                    this._chart.presenter = dataPresenter;
                    // Update the y-axis scale maximum
                    this._scaleChangedEvent.invokeEvent({
                        minimum: 0,
                        maximum: dataPresenter.maximumYValue
                    });
                    this._container.appendChild(this._chart.rootElement);
                }
            }).then(() => {
                this._settingDataPromise = null;
            });
        }
        getDataWarehouse() {
            if (this._dataWarehouse) {
                return Promise.resolve(this._dataWarehouse);
            }
            else {
                return DiagnosticsHub.loadDataWarehouse().then((dataWarehouse) => {
                    this._dataWarehouse = dataWarehouse;
                    return this._dataWarehouse;
                });
            }
        }
    }
    exports.StackedBarGraph = StackedBarGraph;
});
//# sourceMappingURL=HubGraphs.js.map
// SIG // Begin signature block
// SIG // MIIoKgYJKoZIhvcNAQcCoIIoGzCCKBcCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 641vVHlb4/vY2h5xds9l7atdZrb1y+UXsvsNihCuLsKg
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
// SIG // a/15n8G9bW1qyVJzEw16UM0xghoMMIIaCAIBATCBlTB+
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExAhMzAAAE
// SIG // BGx0Bv9XKydyAAAAAAQEMA0GCWCGSAFlAwQCAQUAoIGu
// SIG // MBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisG
// SIG // AQQBgjcCAQsxDjAMBgorBgEEAYI3AgEVMC8GCSqGSIb3
// SIG // DQEJBDEiBCCJ4E6mqTvJEBjFVsquATlYKqf0io/gbYlK
// SIG // rC8f3JuTYDBCBgorBgEEAYI3AgEMMTQwMqAUgBIATQBp
// SIG // AGMAcgBvAHMAbwBmAHShGoAYaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tMA0GCSqGSIb3DQEBAQUABIIBAILOSCB6
// SIG // XS6X3+E6X0XEEI8EsmAK6L2oQhBDvjOZAE4eBQVspUH6
// SIG // dk554ocpKtK+XF9oUhQ58+QIJ50nh01BuWtWjtllLoF2
// SIG // U6mSjKyyJ8LueWhv45bPSJZvdbGfNKvfZKrz8hggurtp
// SIG // bnOFsptFU+mnvBD+3uCcllkw5mB6c7txmjF5G25mHjhn
// SIG // Ciwfc72lDdFewHVJsDmwNU77R6j8lyXTL4jeeGXCODL1
// SIG // pPr2MNiyS3bKoAhSs1uzp8TAvZF0DsubfnDpsCHCSNgI
// SIG // IWOEFaD8lyyIkiF5SZrRQgiQ0tqstSeR5rA1ETcE9gBP
// SIG // G2alBps6sW9l+/xFXGSatqHjrmihgheWMIIXkgYKKwYB
// SIG // BAGCNwMDATGCF4Iwghd+BgkqhkiG9w0BBwKgghdvMIIX
// SIG // awIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUQYLKoZIhvcN
// SIG // AQkQAQSgggFABIIBPDCCATgCAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgrZcP/nkTlxm/7LDqiqSJ
// SIG // uqxqg6b0YMUpYsGNGcG+NUACBmf3yT2T5hgSMjAyNTA0
// SIG // MTUxOTI4MDQuNTNaMASAAgH0oIHRpIHOMIHLMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQg
// SIG // QW1lcmljYSBPcGVyYXRpb25zMScwJQYDVQQLEx5uU2hp
// SIG // ZWxkIFRTUyBFU046OTIwMC0wNUUwLUQ5NDcxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghHtMIIHIDCCBQigAwIBAgITMwAAAgkIB+D5XIzmVQAB
// SIG // AAACCTANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yNTAxMzAxOTQyNTVaFw0y
// SIG // NjA0MjIxOTQyNTVaMIHLMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSUwIwYDVQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVy
// SIG // YXRpb25zMScwJQYDVQQLEx5uU2hpZWxkIFRTUyBFU046
// SIG // OTIwMC0wNUUwLUQ5NDcxJTAjBgNVBAMTHE1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqGSIb3
// SIG // DQEBAQUAA4ICDwAwggIKAoICAQDClEow9y4M3f1S9z1x
// SIG // tNEETwWL1vEiiw0oD7SXEdv4sdP0xsVyidv6I2rmEl8P
// SIG // Ys9LcZjzsWOHI7dQkRL28GP3CXcvY0Zq6nWsHY2QamCZ
// SIG // FLF2IlRH6BHx2RkN7ZRDKms7BOo4IGBRlCMkUv9N9/tw
// SIG // OzAkpWNsM3b/BQxcwhVgsQqtQ8NEPUuiR+GV5rdQHUT4
// SIG // pjihZTkJwraliz0ZbYpUTH5Oki3d3Bpx9qiPriB6hhNf
// SIG // GPjl0PIp23D579rpW6ZmPqPT8j12KX7ySZwNuxs3PYvF
// SIG // /w13GsRXkzIbIyLKEPzj9lzmmrF2wjvvUrx9AZw7GLSX
// SIG // k28Dn1XSf62hbkFuUGwPFLp3EbRqIVmBZ42wcz5mSIIC
// SIG // y3Qs/hwhEYhUndnABgNpD5avALOV7sUfJrHDZXX6f9gg
// SIG // bjIA6j2nhSASIql8F5LsKBw0RPtDuy3j2CPxtTmZozbL
// SIG // K8TMtxDiMCgxTpfg5iYUvyhV4aqaDLwRBsoBRhO/+hwy
// SIG // bKnYwXxKeeOrsOwQLnaOE5BmFJYWBOFz3d88LBK9QRBg
// SIG // dEH5CLVh7wkgMIeh96cH5+H0xEvmg6t7uztlXX2SV7xd
// SIG // UYPxA3vjjV3EkV7abSHD5HHQZTrd3FqsD/VOYACUVBPr
// SIG // xF+kUrZGXxYInZTprYMYEq6UIG1DT4pCVP9DcaCLGIOY
// SIG // EJ1g0wIDAQABo4IBSTCCAUUwHQYDVR0OBBYEFEmL6NHE
// SIG // XTjlvfAvQM21dzMWk8rSMB8GA1UdIwQYMBaAFJ+nFV0A
// SIG // XmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBSoFCG
// SIG // Tmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMv
// SIG // Y3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0El
// SIG // MjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4wXAYI
// SIG // KwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1UdEwEB
// SIG // /wQCMAAwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwgwDgYD
// SIG // VR0PAQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4ICAQBc
// SIG // XnxvODwk4h/jbUBsnFlFtrSuBBZb7wSZfa5lKRMTNfNl
// SIG // maAC4bd7Wo0I5hMxsEJUyupHwh4kD5qkRZczIc0jIABQ
// SIG // Q1xDUBa+WTxrp/UAqC17ijFCePZKYVjNrHf/Bmjz7FaO
// SIG // I41kxueRhwLNIcQ2gmBqDR5W4TS2htRJYyZAs7jfJmbD
// SIG // tTcUOMhEl1OWlx/FnvcQbot5VPzaUwiT6Nie8l6PZjoQ
// SIG // suxiasuSAmxKIQdsHnJ5QokqwdyqXi1FZDtETVvbXfDs
// SIG // ofzTta4en2qf48hzEZwUvbkz5smt890nVAK7kz2crrzN
// SIG // 3hpnfFuftp/rXLWTvxPQcfWXiEuIUd2Gg7eR8QtyKtJD
// SIG // U8+PDwECkzoaJjbGCKqx9ESgFJzzrXNwhhX6Rc8g2EU/
// SIG // +63mmqWeCF/kJOFg2eJw7au/abESgq3EazyD1VlL+HaX
// SIG // +MBHGzQmHtvOm3Ql4wVTN3Wq8X8bCR68qiF5rFasm4Rx
// SIG // F6zajZeSHC/qS5336/4aMDqsV6O86RlPPCYGJOPtf2Mb
// SIG // KO7XJJeL/UQN0c3uix5RMTo66dbATxPUFEG5Ph4PHzGj
// SIG // UbEO7D35LuEBiiG8YrlMROkGl3fBQl9bWbgw9CIUQbwq
// SIG // 5cTaExlfEpMdSoydJolUTQD5ELKGz1TJahTidd20wlwi
// SIG // 5Bk36XImzsH4Ys15iXRfAjCCB3EwggVZoAMCAQICEzMA
// SIG // AAAVxedrngKbSZkAAAAAABUwDQYJKoZIhvcNAQELBQAw
// SIG // gYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMTKU1p
// SIG // Y3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhvcml0
// SIG // eSAyMDEwMB4XDTIxMDkzMDE4MjIyNVoXDTMwMDkzMDE4
// SIG // MzIyNVowfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // ggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDk
// SIG // 4aZM57RyIQt5osvXJHm9DtWC0/3unAcH0qlsTnXIyjVX
// SIG // 9gF/bErg4r25PhdgM/9cT8dm95VTcVrifkpa/rg2Z4VG
// SIG // Iwy1jRPPdzLAEBjoYH1qUoNEt6aORmsHFPPFdvWGUNzB
// SIG // RMhxXFExN6AKOG6N7dcP2CZTfDlhAnrEqv1yaa8dq6z2
// SIG // Nr41JmTamDu6GnszrYBbfowQHJ1S/rboYiXcag/PXfT+
// SIG // jlPP1uyFVk3v3byNpOORj7I5LFGc6XBpDco2LXCOMcg1
// SIG // KL3jtIckw+DJj361VI/c+gVVmG1oO5pGve2krnopN6zL
// SIG // 64NF50ZuyjLVwIYwXE8s4mKyzbnijYjklqwBSru+cakX
// SIG // W2dg3viSkR4dPf0gz3N9QZpGdc3EXzTdEonW/aUgfX78
// SIG // 2Z5F37ZyL9t9X4C626p+Nuw2TPYrbqgSUei/BQOj0XOm
// SIG // TTd0lBw0gg/wEPK3Rxjtp+iZfD9M269ewvPV2HM9Q07B
// SIG // MzlMjgK8QmguEOqEUUbi0b1qGFphAXPKZ6Je1yh2AuIz
// SIG // GHLXpyDwwvoSCtdjbwzJNmSLW6CmgyFdXzB0kZSU2LlQ
// SIG // +QuJYfM2BjUYhEfb3BvR/bLUHMVr9lxSUV0S2yW6r1AF
// SIG // emzFER1y7435UsSFF5PAPBXbGjfHCBUYP3irRbb1Hode
// SIG // 2o+eFnJpxq57t7c+auIurQIDAQABo4IB3TCCAdkwEgYJ
// SIG // KwYBBAGCNxUBBAUCAwEAATAjBgkrBgEEAYI3FQIEFgQU
// SIG // KqdS/mTEmr6CkTxGNSnPEP8vBO4wHQYDVR0OBBYEFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMFwGA1UdIARVMFMwUQYM
// SIG // KwYBBAGCN0yDfQEBMEEwPwYIKwYBBQUHAgEWM2h0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvRG9jcy9S
// SIG // ZXBvc2l0b3J5Lmh0bTATBgNVHSUEDDAKBggrBgEFBQcD
// SIG // CDAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTALBgNV
// SIG // HQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAfBgNVHSME
// SIG // GDAWgBTV9lbLj+iiXGJo0T2UkFvXzpoYxDBWBgNVHR8E
// SIG // TzBNMEugSaBHhkVodHRwOi8vY3JsLm1pY3Jvc29mdC5j
// SIG // b20vcGtpL2NybC9wcm9kdWN0cy9NaWNSb29DZXJBdXRf
// SIG // MjAxMC0wNi0yMy5jcmwwWgYIKwYBBQUHAQEETjBMMEoG
// SIG // CCsGAQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dF8yMDEwLTA2
// SIG // LTIzLmNydDANBgkqhkiG9w0BAQsFAAOCAgEAnVV9/Cqt
// SIG // 4SwfZwExJFvhnnJL/Klv6lwUtj5OR2R4sQaTlz0xM7U5
// SIG // 18JxNj/aZGx80HU5bbsPMeTCj/ts0aGUGCLu6WZnOlNN
// SIG // 3Zi6th542DYunKmCVgADsAW+iehp4LoJ7nvfam++Kctu
// SIG // 2D9IdQHZGN5tggz1bSNU5HhTdSRXud2f8449xvNo32X2
// SIG // pFaq95W2KFUn0CS9QKC/GbYSEhFdPSfgQJY4rPf5KYnD
// SIG // vBewVIVCs/wMnosZiefwC2qBwoEZQhlSdYo2wh3DYXMu
// SIG // LGt7bj8sCXgU6ZGyqVvfSaN0DLzskYDSPeZKPmY7T7uG
// SIG // +jIa2Zb0j/aRAfbOxnT99kxybxCrdTDFNLB62FD+Cljd
// SIG // QDzHVG2dY3RILLFORy3BFARxv2T5JL5zbcqOCb2zAVdJ
// SIG // VGTZc9d/HltEAY5aGZFrDZ+kKNxnGSgkujhLmm77IVRr
// SIG // akURR6nxt67I6IleT53S0Ex2tVdUCbFpAUR+fKFhbHP+
// SIG // CrvsQWY9af3LwUFJfn6Tvsv4O+S3Fb+0zj6lMVGEvL8C
// SIG // wYKiexcdFYmNcP7ntdAoGokLjzbaukz5m/8K6TT4JDVn
// SIG // K+ANuOaMmdbhIurwJ0I9JZTmdHRbatGePu1+oDEzfbzL
// SIG // 6Xu/OHBE0ZDxyKs6ijoIYn/ZcGNTTY3ugm2lBRDBcQZq
// SIG // ELQdVTNYs6FwZvKhggNQMIICOAIBATCB+aGB0aSBzjCB
// SIG // yzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWlj
// SIG // cm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9uczEnMCUGA1UE
// SIG // CxMeblNoaWVsZCBUU1MgRVNOOjkyMDAtMDVFMC1EOTQ3
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQB8762rPTQd7InD
// SIG // CQdb1kgFKQkCRKCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBCwUAAgUA66je
// SIG // zjAiGA8yMDI1MDQxNTEzMzQwNloYDzIwMjUwNDE2MTMz
// SIG // NDA2WjB3MD0GCisGAQQBhFkKBAExLzAtMAoCBQDrqN7O
// SIG // AgEAMAoCAQACAjK0AgH/MAcCAQACAhHzMAoCBQDrqjBO
// SIG // AgEAMDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkK
// SIG // AwKgCjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZI
// SIG // hvcNAQELBQADggEBABkOEMUxYEqF8AHJas9NzxMSarM2
// SIG // /n3O0Py6gKuYd5hGGig5pdV7DoJk4048g2V4zaFI2Aou
// SIG // Gchnip0PgVLaRsxXdbLP+7SoTWvylv46qICydO+m6VNX
// SIG // 3Pdh2oHfreyFnjre7qCPT9Nol1tTPGJpLLY8fyG/Y1uz
// SIG // cYUaDyPA9zFiFvhBMccgODOdlfrJ17cTvfvL59XNo0Gn
// SIG // GQL7NqV5tI2lc09CngVg4ttOcnF7AQZgJnbB5Rm/u+Cu
// SIG // g/d4Dh8QW9b9EM2nH4IKjofseV9WGHw5FH20UXsNLsMk
// SIG // XnKXyfCEHH3M8/b++/o+wpPVqDA+CyVN59JuwXRYlv1d
// SIG // Wt5evRgxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAgkIB+D5XIzmVQABAAAC
// SIG // CTANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCB6
// SIG // g9l9/6c5/yy4HlFhGcyR5/Ct2ai3Hm9jIq0oVEHs9jCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIGgbLB7I
// SIG // vfQCLmUOUZhjdUqK8bikfB6ZVVdoTjNwhRM+MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAIJCAfg+VyM5lUAAQAAAgkwIgQgSIAg1nWzrNKBhaAT
// SIG // 3byGbXtiGjS4f1gmJ5edkDAk8jEwDQYJKoZIhvcNAQEL
// SIG // BQAEggIABXaNbztmgtg8BolV3e7R+amDjxmIWoM391U5
// SIG // D1GHQbycjyQ50TCSkmlsb12Gxc0z+E3NRFGNdn7RwKb/
// SIG // yIBZ65Zi3wD2xImTlEBTUHpegjh6dBdnw5dOvY8E67Tv
// SIG // 7kna9r2Tdd+f2dU2H78CrMQE2am8enCg6i/vLaLI+cu3
// SIG // KsE8ZgaSGC11UwXTI4b4Wy1bIdxSEauluBxg8prQDDRm
// SIG // Z2rpbGuvPFvBeK6egqNDhxJ2agvpuIgfn3Sr+9Fbr+wO
// SIG // BiR5h3rCGBmQHKA7tRwDJ4d9jxtdlgnq85dnF19lvSkQ
// SIG // IhLAgcwCZY39mhc7cMHfQLTxm/Ijmbs2uw12yV1peEzb
// SIG // w/cZOqyUJjTm6jY9ecrbrkKFYblF2T/ltU0a4t0sgv2w
// SIG // 2D5A18vEL6Ki9RDx+Uc9I5w8ypX+qSVnwKxhCzkiGHnK
// SIG // BQb53tl1AeQRd/Yq4UWzJTTZF6+y22JXWmKnrsHpbe24
// SIG // +OWrFZkTbkfROD/pri9RCZK8K9OuzQQKEA70irdx85z9
// SIG // azDzuAuQC9zQY7VeNPui/n395ALUnNkjdu4jwbh4iKKy
// SIG // s2ldIsHpCEcZIfbXk7pHvycAi+wRFJWN7i2+ZPTN6oLM
// SIG // /0eL1UW5yXaKQOOX+bl6Hfa/kD+IrgOwS2UQ4qzzC9SI
// SIG // coA2OOReywLLnJFlQSquscQZzzaNVRQ=
// SIG // End signature block
