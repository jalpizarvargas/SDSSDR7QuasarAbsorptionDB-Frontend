import { Component } from "@angular/core";
import { QuasarCatalogService } from "src/app/service/quasarCatalog.service";

@Component({
    selector: 'home-page',
    templateUrl: './homePage.component.html',
    styleUrls: ['./homePage.component.scss']
})

export class HomePageComponent{

    constructor(
        private catalog:QuasarCatalogService
    ){}

    /**
     * Code that downloads the original catalog in its .fits format from the API
     */
    onClickDownloadCatalog(){
        this.catalog.getCatalogFile().subscribe({next: data => {
            const blob = new Blob([data], { type: "application/zip" });
            var downloadURL = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = downloadURL;
            link.download = "DR7_QSOALS_catalog_091714.zip";
            link.click();
        }, error: e => {
                alert("Lost Connection to Server, Please try again later");
            }
        });
    }
}