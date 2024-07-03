import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navigation/navbar.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuasarTableComponent } from './component/QuasarTable/quasarTable.component';
import { HomePageComponent } from './component/Home/homePage.component';
import { NotFoundComponent } from './component/NotFound/notFound.component';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { ArchiveOverlay } from './component/Overlay/QuasarArchiveOverlay/archiveOverlay.component';
import { DataModelComponent } from './component/DataModel/dataModel.component';
import { QsoalsCatalogueComponent } from './component/DataModel/QsoalsCatalogue/qsoalsCatalogue.component';
import { AbsorptionLinesGraphComponent } from './component/DataModel/AbsorptionLinesGraph/absorptionLinesGraph.component';
import { AbsorptionDataFilesComponent } from './component/DataModel/AbsorptionDataFiles/absorptionDataFiles.component';
import { AbsorptionCatalogueTableFilesComponent } from './component/DataModel/AbsorptionCatalogueTableFiles/absorptionCatalogueTableFiles.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomePageComponent,
    QuasarTableComponent,
    NotFoundComponent,
    ArchiveOverlay,
    DataModelComponent,
    QsoalsCatalogueComponent,
    AbsorptionLinesGraphComponent,
    AbsorptionDataFilesComponent,
    AbsorptionCatalogueTableFilesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    OverlayModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
