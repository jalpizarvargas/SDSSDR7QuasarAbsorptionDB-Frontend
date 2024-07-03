import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'data-model',
    templateUrl: './dataModel.component.html',
    styleUrls: ['./dataModel.component.scss']
})

export class DataModelComponent implements OnInit{

    //Map that keeps track of which model or documentation to display
    modelsToShowMap:Map<string,boolean> = new Map<string,boolean>([
        ['qsoals-fits-catalogue',true],
        ['absorption-lines-graph',false],
        ['absorption-data-files',false],
        ['absorption-catalogue-table-files',false]
    ]);

    ngOnInit(): void {
        let currentPage = window.location.pathname;
        currentPage = currentPage.slice(11);
        
        this.changeDocument(currentPage);
    }

    /**
     * This function changes which models or documentation to display
     * 
     * @param modelName Name of the model/document to display
     */
    changeDocument(modelName:string){

        this.modelsToShowMap.forEach((value:boolean,key:string) =>{
            this.modelsToShowMap.set(key,false);         
        });

        this.modelsToShowMap.set(modelName,true);
       
    }

}