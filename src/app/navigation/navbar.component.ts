import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {

    //Map that keeps track of which is the currently selected page
    navBarButtonsMapping:Map<string,boolean> = new Map<string,boolean>([
        ['home',false],
        ['',false],
        ['quasartable',false],
        ['datamodel',false]
    ]) 

    ngOnInit(): void {
        //Check current pathname to ensure porper selection
        let currentPage = window.location.pathname;
        currentPage = currentPage.slice(1);
        if(currentPage.includes('/')){
            currentPage = currentPage.substring(0, currentPage.indexOf('/'));
        }
        this.toggleSelected(currentPage);
    }

    /**
     * Changes which button is shown to be selected in the navbar
     * 
     * @param pageName Name of the currently selected page
     */
    toggleSelected(pageName:string){
        
        this.navBarButtonsMapping.forEach((value:boolean,key:string) =>{
            this.navBarButtonsMapping.set(key,false);         
        });

        this.navBarButtonsMapping.set(pageName,true);

    }

}