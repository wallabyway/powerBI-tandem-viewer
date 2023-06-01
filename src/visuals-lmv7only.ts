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
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private readonly URN: string = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Y29uc29saWRhdGVkL2ljZSUyMHN0YWRpdW0ubndk';

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        if (!document) return;
        options.element.innerHTML = `<div id="Viewer"></div>`;        
        //this.startViewer(this.URN);
        this.startTandem();
    }

    private async addJSFiles(): Promise<void> {  
        return new Promise<void>((resolve,reject) => {
            let link = document.createElement("link");
            link.href = 'https://tandem.autodesk.com/viewer/style.min.css';
            link.type = 'text/css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            let el = document.createElement('script');
            el.src = 'https://tandem.autodesk.com/viewer/viewer3D.min.js';
            document.head.appendChild(el);
            el.onload = () => { resolve() }
        })
    }

    private async startTandem() {
        await this.addJSFiles();
        const tandem = new tandemViewer();
        await tandem.init();
        console.log('fetchFacilities');
        const allFacilities = await tandem.fetchFacilities();
        console.log(allFacilities);
        await tandem.openFacility(allFacilities[1]);        
    }
/*
    private async startViewer(urn: any) {
        await this.addJSFiles();
        const AV = Autodesk.Viewing;

        AV.Initializer({ env: "AutodeskProduction", accessToken: this._access_token }, () => {
            const options = { extensions: ["Autodesk.ExtensionsPanel"] };
            const viewer = new AV.Private.GuiViewer3D(document.getElementById("Viewer"), options);
            viewer.start();
            viewer.setTheme("light-theme");
            AV.Document.load(`urn:${urn}`, (doc) => {
                var viewables = doc.getRoot().getDefaultGeometry();
                viewer.loadDocumentNode(doc, viewables);
            });
        });
    }    
*/
    public update(options: VisualUpdateOptions) {
        console.log('Visual update', options);
        //this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        if (this.textNode) {
            this.textNode.textContent = (this.updateCount++).toString();
        }
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
    private readonly _access_token: string = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIiwicGkuYXRtIjoiN3ozaCJ9.eyJzY29wZSI6WyJkYXRhOnJlYWQiXSwiY2xpZW50X2lkIjoiY3czeVlHMHdDdkRPY1B4eGZIOTFVQzFLSFd1YWpKeVIiLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoiTzZ6QVdQUHY2U0NiaDQ2cnB3NnZick9LOTRSNGpQS3RpUFVTN1pGVU96UEM1bnhKOGRYYWpISmVreEUzRUk3TyIsImV4cCI6MTY4NDM1ODc1MH0.cqVwbqYW4hecrAfPd8AyWHwZ9NTgmNWXyxYlo-xuo665hbXCDQ7CdLq93nW689USF0mVGFBRN0mNHOleaN9gEhSvESKdCwSxNNrK4obm67ZKTh-DKrY2mMkzpFXUusEdCKWc_i175p4qe7JOV0-HZ7pCov_awiT-fLDoH0oOLM-siFBkv2KinjbvZdHIgkl12Af2ECBRiYbnTj98j2ZrH5KI9qYAHw0-3_SW7dQzG0jEvPhtitwd__4GyyYNL0NCoBss9BXYY59Ut9X4aUtDbe142sorErKVi07bMEcxBChBTOApYIMAsA74dSXdOEhxjCufIxoSVIGO7b8RMeTtWw';  

    async init() {
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
                av.endpoint.HTTP_REQUEST_HEADERS['Authorization'] = `Bearer ${this._access_token}`;
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
}