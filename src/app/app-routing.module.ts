import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from "./component/Home/homePage.component";
import { QuasarTableComponent } from "./component/QuasarTable/quasarTable.component";
import { NotFoundComponent } from "./component/NotFound/notFound.component";
import { DataModelComponent } from './component/DataModel/dataModel.component';
import { QsoalsCatalogueComponent } from './component/DataModel/QsoalsCatalogue/qsoalsCatalogue.component';
import { AbsorptionLinesGraphComponent } from './component/DataModel/AbsorptionLinesGraph/absorptionLinesGraph.component';
import { AbsorptionDataFilesComponent } from './component/DataModel/AbsorptionDataFiles/absorptionDataFiles.component';
import { AbsorptionCatalogueTableFilesComponent } from './component/DataModel/AbsorptionCatalogueTableFiles/absorptionCatalogueTableFiles.component';

const routes: Routes = [
    {path: 'home', component: HomePageComponent},
    {path: 'quasartable', component: QuasarTableComponent},
    {path: 'datamodel', component:DataModelComponent, children: [
        {path: 'qsoals-fits-catalogue', component:QsoalsCatalogueComponent},
        {path: 'absorption-lines-graph', component:AbsorptionLinesGraphComponent},
        {path: 'absorption-data-files', component:AbsorptionDataFilesComponent},
        {path: 'absorption-catalogue-table-files', component:AbsorptionCatalogueTableFilesComponent},
        {path: '', redirectTo:'qsoals-fits-catalogue', pathMatch:'full'},
        {path: '**', component: NotFoundComponent}
    ]},
    {path: '', redirectTo:'home', pathMatch:'full'},
    {path: '**', component: NotFoundComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})

export class AppRoutingModule{};