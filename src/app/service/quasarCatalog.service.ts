import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, forkJoin} from 'rxjs';
import { APIResponse } from '../interface/apiResponse.interface';

@Injectable({
    providedIn: 'root'
})

export class QuasarCatalogService{

    private apiUrl:string = "https://yorkshire.cs.unca.edu:1088/api/QuasarCatalogDB/";

    constructor(private http: HttpClient){}

    /**
     * Sends a http request to API for the requested table
     * 
     * @param tableName Name of the table in the database tp get
     * @returns The database table requested
     */
    getDatabaseTable(tableName:string):Observable<APIResponse>{
        return this.http.get<APIResponse>(this.apiUrl + tableName);
    }

    /**
     * Sends a sequence of http requests to the API, gets the entire database
     * 
     * @returns All the database tables
     */
    getDatabaseData():Observable<APIResponse[]>{
        const $lambdaVac = this.http.get<APIResponse>(this.apiUrl + "lambda_vac");
        const $wLimits = this.http.get<APIResponse>(this.apiUrl + "w_limits");
        const $lambdaObs = this.http.get<APIResponse>(this.apiUrl + "lambda_obs");
        const $lyaFlag = this.http.get<APIResponse>(this.apiUrl + "lya_flag");
        const $gradeflag = this.http.get<APIResponse>(this.apiUrl + "gradeflag");
        const $fwhm = this.http.get<APIResponse>(this.apiUrl + "fwhm");
        const $ewObs = this.http.get<APIResponse>(this.apiUrl + "ew_obs");
        const $ewErrObs = this.http.get<APIResponse>(this.apiUrl + "ew_err_obs");
        const $deltazSys = this.http.get<APIResponse>(this.apiUrl + "deltaz_sys");
        const $deltavSys = this.http.get<APIResponse>(this.apiUrl + "deltav_sys");
        const $blendflag = this.http.get<APIResponse>(this.apiUrl + "blendflag");
        const $catalog = this.http.get<APIResponse>(this.apiUrl + "catalog");
        
        return forkJoin([
            $lambdaVac,
            $wLimits,
            $lambdaObs,
            $lyaFlag,
            $gradeflag,
            $fwhm,
            $ewObs,
            $ewErrObs,
            $deltazSys,
            $deltavSys,
            $blendflag,
            $catalog
        ]);
        
    }

    /**
     * Sends an http request for the original catalog .fits file
     * 
     * @returns A compressed folder with the original catalog
     */
    getCatalogFile():Observable<any>{
        let url = this.apiUrl + "downloadCatalog";
        return this.http.get(url,{responseType:'arraybuffer'});
    }
 
    /**
     * Sends an http request for all the archived files associated with an observation
     * 
     * @param plateNum Number of the plate used for the observation
     * @param fiberNum Number of the fiber used to meassure the observation
     * @returns A compressed ZIP folder with all of the archive files associated with an observation
     */
    getArchiveEntry(plateNum:number,fiberNum:number):Observable<any>{
        let url = this.apiUrl + "downloadEntryFiles/" + plateNum + "/" + fiberNum;
        return this.http.get(url,{responseType:"arraybuffer"});
    }

}