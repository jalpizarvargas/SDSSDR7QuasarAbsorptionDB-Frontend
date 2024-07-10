import { Component, Input } from "@angular/core";
import { QuasarCatalogService } from "src/app/service/quasarCatalog.service";
import { OnInit } from "@angular/core";
import * as JSZip from "jszip";

@Component({
    selector:'archive-overlay',
    templateUrl: './archiveOverlay.component.html',
    styleUrls: ['./archiveOverlay.component.scss'],
})

export class ArchiveOverlay implements OnInit {

    //Variable that keeps track of when the images from the archive entry have been loaded
    imagesLoaded:boolean = false;

    //Variable that keeps track of when there is an error loading the images
    failedToLoad:boolean = false;

    //Number of .png images found in the archive entry that will be displayed in the overlay
    imageToDisplay:number = 0;

    //Local varaible that stores the ZIP file from the API
    archiveEntry:Blob;

    //Array that stores the images that are going to be displayed from the archive entry
    fileData:string[] = ['',''];

    //Array that stores the designation for data recorded in the graph
    graphs:string[] = [];

    //Variable that disables/enables the previous button
    prevDisable:boolean = true;

    //Variable that disables/enables the next button
    nextDisable:boolean = false;

    //Plate number of the entry from the table page
    @Input() plateNum:number = 0;

    //Fiber number of the entry from the table page
    @Input() fiberNum:number = 0;

    //MJD of the entry from the table page
    @Input() mjd:number = 0;

    constructor(
        private archive:QuasarCatalogService
    ){}


    ngOnInit(): void {

        //Sends the http request to the API for the requested archive directory
        this.archive.getArchiveEntry(this.plateNum,this.fiberNum).subscribe({next: entry => {
            this.archiveEntry = new Blob([entry],{type:"application/zip"});
            //Opens the compressed directory
            JSZip.loadAsync(this.archiveEntry).then((zip) => {
                //Iterates through the files in the directory 
                Object.keys(zip.files).forEach((filename) => {
                    zip.files[filename].async('blob').then((fileData) => {
                    //Reads the names of the files, if it contains a ".png" and is not a "thumb image" its added to the array
                    if(filename.includes(".png") && !filename.includes('thumb')){

                        if(filename.startsWith('n')){
                            this.fileData[0] = URL.createObjectURL(fileData);
                        }else{
                            this.fileData[1] = URL.createObjectURL(fileData);
                        }

                    }});
                });
                this.graphs.push("Non-Normalized")
                this.graphs.push("Normalized")
                this.imagesLoaded = true;
            });
        }, error: e => {
                console.log(e);
                alert("Lost Connection to Server, Please try again later");
                this.failedToLoad = true;
            }
        });  
    }

    /**
     * Function that shows the next image
     */
    nextImage(){
        if((this.imageToDisplay + 1) < this.fileData.length){
            this.imageToDisplay += 1;
            this.prevDisable = false;
        }

        if(this.imageToDisplay >= (this.fileData.length-1)){
            this.nextDisable = true;
        }
    }

    /**
     * Function that shows the previous image
     */
    prevImage(){
        if((this.imageToDisplay - 1) >= 0){
            this.imageToDisplay -= 1;
            this.nextDisable = false;
        }

        if(this.imageToDisplay == 0){
            this.prevDisable = true;
        }
    }

    /**
     * Function that downloads the archive when the user requests it
     */
    downloadArchive(){
        const url = window.URL.createObjectURL(this.archiveEntry);
        var link = document.createElement('a');
        link.href = url;
        link.download = "spec_" + this.plateNum + "_" + this.fiberNum + "_" + this.mjd + ".zip";
        link.click();
    }

    openURL(){
        window.open('../datamodel/absorption-lines-graph');
    }

}