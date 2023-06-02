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
        await this.tandem.openFacility(allFacilities[2]);        
    }

    private async getAccessToken(): Promise<string> {
        const endpoint = 'https://f2iv2mhpbebrhrkfsnn2lvloxq0janqb.lambda-url.us-west-2.on.aws';
        const token = await (await fetch(endpoint)).text();
        return token;
    }

    private async addJSFiles(): Promise<void> {
        return new Promise<void>((resolve,reject) => {
            let link = document.createElement("link");
            link.href = 'https://tandem.autodesk.com/viewer/style.min.css';
            link.type = 'text/css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            let elt = document.createElement('script');
            elt.src = 'https://tandem.autodesk.com/viewer/viewer3D.min.js';
            document.head.appendChild(elt);

            link.onload = () => { 
                elt.onload = () => { resolve() }    
            }
        })
    }

    public update(options: VisualUpdateOptions) {
        if((options.type != 2) ) return; //ignore resizing or moving
                
        console.log("parseSettings");
        console.log(options.dataViews[0]);                
        this.tandem.updateVisibility(options.dataViews[0].table.rows);
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
                av.endpoint.HTTP_REQUEST_HEADERS['Authorization'] = `Bearer ${_access_token}`;
                this.app = new av.Private.DtApp({});
                this.viewer.setGhosting(false);
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

    updateVisibility ( list:any ) {
        // This is the fastest visibility switching technique for multi-model
        const isNoneSelected = (list.length == 0);

        // 1. hide everything.
        this.app.currentFacility.modelsList.map ( (model:any) => model.setAllVisibility(isNoneSelected));

        // 2. Set elements to visible, per model  
        if (isNoneSelected) return;
        this.app.currentFacility.modelsList.map ( (model:any) => {
            list.map( async (i:any) => {
                const [urn, elementId] = i;
                if (model._modelId == urn) {
                    const dbid = await model.getDbIdsFromElementIds([ elementId ]);
                    model.visibilityManager.setVisibilityOnNode( dbid, true);        
                }
            })
        });
    }
        
}