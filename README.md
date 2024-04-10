# powerBI-Tandem-Viewer

This is the visual component for Tandem Viewer, embedded inside PowerBi.  

**DEMO**: https://app.powerbi.com/groups/me/reports/7cbd742c-5dab-451a-9f20-7d38e9c0e456/ReportSection?experience=power-bi

<video src="https://github.com/wallabyway/powerBI-tandem-viewer/assets/440241/bf975446-652e-4754-b1af-84fc974078b3"></video>



<br><hr>

## NOTES
- It uses two Legged Auth (see [hello world](https://github.com/wallabyway/tandem-api-hello-world) Tandem example)
- A Lambda service provides tokens
- The tokens are locked to the Service Account permissions

```mermaid
%%{init: {'theme': 'neutral' , "themeVariables": {'fontFamily':'courier', 'fontSize' : '12px'} }}%%
graph LR;
  A[Token Generator <br> lambda-url.us-west-2.on.aws]
  B[Tandem Viewer <br> PowerBi.com]
  A --> B

```
<br><hr>

## SETUP

From the diagram:

![](xls/add-urn-elementid.JPG)

### ADD VIZ (Green Arrow)
1. Click 'More' button, add Visual Component from file
2. Select `/dist/tandem-viz-powrebi.pbiviz` 
3. Click new icon
4. The Tandem viewer is added to the canvas (green arrow)


### CONFIGURE (Orange Arrow)
5. Search for `urn`, `elemID`
6. Drag these into URN field


## RUN

Click on elements in the chart to see the viewer change appearance


## FURTHER REFERENCES

- https://github.com/petrbroz/endymion-next/tree/master/visuals/cached-derivs-viewer-visual
- https://github.com/petrbroz/endymion-next
- https://aps.autodesk.com/en/docs/endymion/v1/developers_guide/setup/
