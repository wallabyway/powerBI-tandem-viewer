/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

declare var Autodesk: any;

import { VisualSettings } from "./settings";
export class Visual implements IVisual {
    private settings: VisualSettings;
    private tandem: tandemViewer;

    constructor(options: VisualConstructorOptions) {
        if (!document) return;
        options.element.innerHTML = `<div id="Viewer"></div>`;        
        this.startTandem();
    }

    private async startTandem() {
        await this.addJSFiles();
        const token = await this.getAccessToken();
        this.tandem = new tandemViewer();
        await this.tandem.init(token);
        const allFacilities = await this.tandem.fetchFacilities();
        console.log(allFacilities);
        await this.tandem.openFacility(allFacilities[1]);        
    }

    private async getAccessToken(): Promise<string> {
        const endpoint = 'https://f2iv2mhpbebrhrkfsnn2lvloxq0janqb.lambda-url.us-west-2.on.aws';
        const token = await (await fetch(endpoint)).text();
        console.log(token);
        return token;
    }

    private async addJSFiles(): Promise<void> {
        return new Promise<void>((resolve,reject) => {
            let link = document.createElement("link");
            link.href = 'https://tandem.autodesk.com/viewer/style.min.css';
            link.type = 'text/css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            link.onload = () => { 
                let elt = document.createElement('script');
                elt.src = 'https://tandem.autodesk.com/viewer/viewer3D.min.js';
                document.head.appendChild(elt);
                elt.onload = () => { resolve() }    
            }

            
            // let el = document.createElement('img');
            // el.src = 'https://f2iv2mhpbebrhrkfsnn2lvloxq0janqb.lambda-url.us-west-2.on.aws';
            // document.body.appendChild(el);
            //el.onload = () => { resolve() }
        })
    }


    public update(options: VisualUpdateOptions) {
        if((options.type == 4) ) //resizing or moving
                return;
        //this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        this.tandem.updateSelection(options.dataViews[0].table.rows);
        console.log(options.dataViews[0].table.rows)
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}


// initialize Tandem Viewer and load different facilities
class tandemViewer {
    viewer: any;
    app: any;

    async init(_access_token:string) {
        return new Promise(resolve=>{
            const av = Autodesk.Viewing;

            const options = {
                env: "DtProduction",
                api: 'dt',
                productId: 'Digital Twins',
                corsWorker: true,
            };
            av.Initializer(options, () => {
                this.viewer = new av.GuiViewer3D(document.getElementById("Viewer"), {
                    extensions: ['Autodesk.BoxSelection'],
                    screenModeDelegate: av.NullScreenModeDelegate,
                    theme: 'light-theme',
                });
                this.viewer.start();
                console.log("_access_token",_access_token)
                av.endpoint.HTTP_REQUEST_HEADERS['Authorization'] = `Bearer ${_access_token}`;
                this.app = new av.Private.DtApp({});
                resolve(this);
            });
    })}

    async fetchFacilities() {
        const FacilitiesSharedWithMe = await this.app.getCurrentTeamsFacilities();
        const myFacilities = await this.app.getUsersFacilities();
        return [].concat(FacilitiesSharedWithMe, myFacilities);
    }

    async openFacility(facility:any) {
        this.app.displayFacility(facility, false, this.viewer);
    }

    updateSelection ( list, type=1 ) {
        // const result = {};
        // list.forEach( async ([urn, elementId]) => {
        //     if (!result[urn]) result[urn] = [];
        //     result[urn].push(elementId);
        // });
        //this.viewer.clearSelection();
        this.app.currentFacility.modelsList.map ( model => model.setAllVisibility(false));

        list.map( async (i) => {
            const model = this.app.currentFacility.modelsList.filter((m) => m._modelId == i[0])
            const dbid = await model[0].getDbIdsFromElementIds([ i[1] ]);
            model[0].visibilityManager.setVisibilityOnNode( dbid, true);
            //model[0].selector.toggleSelection( dbid, type);
        } )
    }
        
}