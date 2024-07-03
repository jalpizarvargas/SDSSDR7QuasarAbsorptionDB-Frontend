import { Component, ViewChild} from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { QuasarCatalog } from "src/app/interface/quasarCatalog.interface";
import { QuasarCatalogService } from "src/app/service/quasarCatalog.service";
import { Overlay } from "@angular/cdk/overlay";
import { ArchiveOverlay } from "../Overlay/QuasarArchiveOverlay/archiveOverlay.component";
import { OnInit } from "@angular/core";
import { saveAs } from "file-saver";
import { ComponentPortal } from "@angular/cdk/portal";

@Component({
    selector: 'quasar-table',
    templateUrl: './quasarTable.component.html',
    styleUrls: ['./quasarTable.component.scss']
})

export class QuasarTableComponent implements OnInit{

    @ViewChild('overlayTemplate') overlayTemplate:any;

    //Form used to gather input from user to filter the dataset 
    tableFormatForm:FormGroup;

    //Value used to enable or disable the submit button for the filter form
    disableButton:boolean = true;

    //Value used to enable or disable the reset button for the filter form
    resetTableButton:boolean = true;

    //Value that communicates if the page is currently loading the catalog
    loadingCatalog:boolean = true;

    //Determines starting point for the results to display
    entriesToDisplayStart:number = 0;

    //Variable that disables/enables the previous button
    prevDisable:boolean = true;

    //Determines end point for the results to display
    entriesToDisplayEnd:number = 999;

    //Variable that disables/enables the next button
    nextDisable:boolean = false;

    //If the current list of results is less than a thousand
    lessThanOneThousandResults:boolean = false;

    //List of catlog entries from API
    generalCatalogComplete:QuasarCatalog[] = [];

    //List of catalog entries from API with filters applied
    generalCatalogFiltered:QuasarCatalog[] = [];

    //Communicates if there was an error loading the catalog data
    failedToLoadData:boolean = false;

    //Map that keeps track of range errors in user input
    rangeValidationError:Map<string,boolean> = new Map<string,boolean>([
        ['qRedshiftStart',false],
        ['qRedshiftEnd',false],
        ['aRedshiftStart',false],
        ['aRedshiftEnd',false],
        ['raDegStart',false],
        ['raDegEnd',false],
        ['decDegStart',false],
        ['decDegEnd',false],
        ['imagStart',false],
        ['imagEnd',false]
    ])

    //Map that keeps track of which filters are applied to the data
    tableFilters:Map<string,boolean> = new Map<string,boolean>([
        ['plateNum',false],
        ['fiberNum',false],
        ['classScore',false],
        ['mg2Score',false],
        ['otherScore',false],
        ['qRedshift',false],
        ['aRedshift',false],
        ['raDeg',false],
        ['decDeg',false],
        ['imag',false]
    ])

    constructor(
        private formBuilder: FormBuilder,
        private catalog : QuasarCatalogService,
        private overlay : Overlay
    ){
        this.tableFormatForm = this.formBuilder.group({
            //Plate number of the observation
            plateNum: new FormControl(null, [Validators.min(266),Validators.max(2974),Validators.pattern(/^[0-9]\d*$/)]),
            //Fiber number of the observation
            fiberNum: new FormControl(null, Validators.pattern(/^[0-9]\d*$/)),
            //Class Score of the observation
            classScore: new FormControl(null, [Validators.min(-1),Validators.max(1),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //MgII Score of the observation
            mg2Score: new FormControl(null, [Validators.min(-1),Validators.max(1),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Other class Score of the observation
            otherScore: new FormControl(null, [Validators.min(-1),Validators.max(1),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Minium Values for the Quasar Redshift
            qRedshiftStart: new FormControl(null, [Validators.min(-1),Validators.max(10),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Maximum Values for the Quasar Redshift
            qRedshiftEnd: new FormControl(null, [Validators.min(-1),Validators.max(10),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Toggle for Observation with no Spectra
            noDetectionSpectra: null,
            //Minium Values for the Absorber Redshift
            aRedshiftStart: new FormControl(null, [Validators.min(-1),Validators.max(10),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Maximum Values for the Absorber Redshift
            aRedshiftEnd: new FormControl(null, [Validators.min(-1),Validators.max(10),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Minium Values for the Ra Degree
            raDegStart: new FormControl(null, [Validators.min(0),Validators.max(360),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Maximum Values for the Ra Degree
            raDegEnd: new FormControl(null, [Validators.min(0),Validators.max(360),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Minium Values for the Dec Degree
            decDegStart: new FormControl(null, [Validators.min(-90),Validators.max(90),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Maximum Values for Dec Degree
            decDegEnd: new FormControl(null, [Validators.min(-90),Validators.max(90),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Minium Values for Imag
            imagStart: new FormControl(null, [Validators.min(0),Validators.max(22),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]),
            //Maximum Values for Imag
            imagEnd: new FormControl(null, [Validators.min(0),Validators.max(22),Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)])
        })
    }

    ngOnInit(): void {
        this.tableFormatForm.disable();

        //Load catalog on page load
        this.onGetCatalog();
    }
    
    /**
     * Retrieves the Quasar Catalog from the API and stores it in a local varibale,
     * will enable filter form upon loading the catalog
     */
    onGetCatalog(){
        this.catalog.getDatabaseTable("catalog").subscribe({next: response => {

            //Gets the rest of the catalog values into a local variable from the API and sorts entries on ascending order of ID
            response.responseData.map(entry =>{
                this.generalCatalogComplete.push(entry);
            });

            this.generalCatalogComplete.sort((a,b)=> a.id - b.id);
            

            //Makes copy of catalog to local variable as reference
            this.generalCatalogFiltered = this.generalCatalogComplete;

            //Enables Table Filter Form
            this.tableFormatForm.enable();

            //Enables Table Filter Form Buttons
            this.disableButton = false;

            //Indicates that data has finished loading
            this.loadingCatalog = false;

            if(sessionStorage.length != 0){
                this.onSubmit();
            }

        }, error: e => {
                this.failedToLoadData = true;
                alert("Lost Connection to Server, Please try again later");
            }
        });
    }

    /**
     * Redirects the user to the database site where the data was gathered
     * 
     * @param plateNum Number of the plate where observation was gathered 
     * @param fiberNum Number of the fiber used for the observation 
     * @param mjd Modified Julian Date of the Observation
     */
    openURL(plateNum:number,fiberNum:number,mjd:number){
        window.open('https://skyserver.sdss.org/dr18/VisualTools/explore/summary?plate='+ plateNum +'&mjd='+ mjd +'&fiber=' + fiberNum, '_blank');
    }

    /**
     * Generates a CSV file for the user with their current selection of the data
     * 
     * @param data The catalog with the filters chosen by the user
     */
    downloadTableCSV(data:any){
        let array = typeof data != 'object' ? JSON.parse(data) : data;
        const replacer = (key, value) => value === null ? '' : value;
        var header = Object.keys(data[0]);
        //Determines Which Columns to exclude from the CSV file
        header = header.filter(v => 
            v != 'id' && 
            v !='z_fgal' && 
            v != 'ra_hex' && 
            v != 'dec_hex' && 
            v != 'avesnr_spec' && 
            v != 'run_date');
        let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(header.join(','));
        let csvArray = csv.join('\r\n');
        var blob = new Blob([csvArray], {type: 'text/csv' })
        saveAs(blob, "table.csv");
    }

    /**
     * Generates the overlay to display the graphics found in the archive entry of the selected row, also where this entry is available for download
     * 
     * @param fiberNum Number of the fiber of the archive entry
     * @param plateNum Number of the plate of the archive entry
     * @param mjd Modified Julian Date of the archive entry
     */
    openArchiveOverlay(plateNum:number,fiberNum:number,mjd:number){
        const overlayRef = this.overlay.create({
            width: '60%',
            hasBackdrop: true,
            panelClass: 'overlay-panel',
            scrollStrategy: this.overlay.scrollStrategies.noop(),
            positionStrategy: this.overlay
            .position()
            .global()
            .centerHorizontally()
            .centerVertically(),
        });
        const archivePortal = new ComponentPortal(ArchiveOverlay);
        const ref = overlayRef.attach(archivePortal);
        ref.instance.plateNum = plateNum;
        ref.instance.fiberNum = fiberNum;
        ref.instance.mjd = mjd;
        overlayRef.backdropClick().subscribe(() => overlayRef.detach());
    }

    /**
     * Logic behind clicking the next table button
     */
    nextTable(){
        if(!((this.generalCatalogFiltered.length - this.entriesToDisplayEnd - 1000) < -1000) && this.generalCatalogFiltered.length > 1000){
            this.entriesToDisplayEnd += 1000;
            this.entriesToDisplayStart += 1000;
            this.prevDisable = false;
        }

        //Disables the next button when it reaches the maximum number of items that can be displayed
        if((this.generalCatalogFiltered.length - this.entriesToDisplayEnd - 1000) < -1000){
            this.nextDisable = true;
        }
    }

    /**
     * Logic behind clicking the previous table button
     */
    prevTable(){
        //If going back results in loading results in positions lass than 0 disable previous button
        if(!((this.entriesToDisplayStart - 1000) < 0) || !(this.entriesToDisplayStart == 0)){
            this.entriesToDisplayEnd -= 1000;
            this.entriesToDisplayStart -= 1000;
            this.nextDisable = false;
        }

        //Disables the previous button when the first 1000 items of the table are displayed
        if(this.entriesToDisplayStart == 0){
            this.prevDisable = true;
        }
    }

    /**
     * Triggers input alerts for the table if any user input is considered invalid
     * 
     * @param formComponent Field of the form to evaluate
     * @param formComponent2 Optional Second form field associated with the first one
     * @param rangeType Range value space to evaluate
     * @returns True if any field of the form is invalid
     */
    inputAlert(formComponent:any,formComponent2:any=null,rangeType:any=null){

        var temp = false;

        //If only one field is evaluated just check it's input
        if(formComponent2 === null && rangeType === null){
           
            temp = this.inputCheck(formComponent);

        //If more than one field is evaluated proceed depending of range type
        }else{
            
            temp = this.rangeInputAlert(formComponent,formComponent2);

            if(!temp){
                if(rangeType === 'max'){
                    temp = this.inputCheck(formComponent2);
                }else{
                    temp = this.inputCheck(formComponent);
                }
            }

        }

        //Check if any input on the form is invalid and disable submit function accordingly
        if(!this.loadingCatalog){
            if(this.tableFormatForm.invalid){
                this.disableButton = true;
            }else{
                this.disableButton = false;
            }
        }

        return temp;
    }

    /**
     * Checks if the given input is invalid
     * 
     * @param formComponent Form field to check
     * @returns True if the current field is considered an invalid entry
     */
    inputCheck(formComponent:any){
        if(this.tableFormatForm.get(formComponent).errors != null && this.tableFormatForm.get(formComponent).value != null){
            return true;
        }else{
            return false;
        }
    }

    /**
     * Checks if the given value range is considered an invalid range
     * 
     * @param startFormInput Form field containing the minimum value
     * @param endFormInput Form field containing the maximum value
     * @returns True if the range is invalid
     */
    rangeInputAlert(startFormInput:any,endFormInput:any){
        const min = +this.tableFormatForm.get(startFormInput).value;
        const max = +this.tableFormatForm.get(endFormInput).value;

        if(max < min && !isNaN(+this.tableFormatForm.get(startFormInput).value) && !isNaN(+this.tableFormatForm.get(endFormInput).value)
        && this.tableFormatForm.get(endFormInput).value != '' && this.tableFormatForm.get(endFormInput).value != null){
            this.rangeValidationError.set(startFormInput,true);
            this.rangeValidationError.set(endFormInput,true);
            return true;
        }else{
            this.rangeValidationError.set(startFormInput,false);
            this.rangeValidationError.set(endFormInput,false);
            return false;
        }
        
    }

    checkForRangeErrors(){
        var temp = false
        this.rangeValidationError.forEach(v =>{
            if(v === true){
                temp = true;
            }
        });

        return temp;
    }

    /**
     * If the "Spectra with no detections" option is selected disable the Absorber Redshift fields
     */
    noSpectraCheck(){
        if(this.tableFormatForm.get('noDetectionSpectra').value){
            this.tableFormatForm.get('aRedshiftStart').enable();
            this.tableFormatForm.get('aRedshiftEnd').enable();
        }else{
            this.tableFormatForm.get('aRedshiftStart').disable();
            this.tableFormatForm.get('aRedshiftEnd').disable();
        }
    }

    /**
     * Excutes when the user submits values to filter the table by and applies the criteria to the current table
     */
    onSubmit():void{

        //Reference back to unfiltered catalog
        this.generalCatalogFiltered = this.generalCatalogComplete;

        //Default reset button off unless filter is applied
        this.resetTableButton = true;

        //Default next table button on unless filtered list is under 1000
        this.nextDisable = false;

        //Apply Plate Number Filter
        if(sessionStorage.getItem('plateNum') != null && this.tableFormatForm.get('plateNum').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.plate === +sessionStorage.getItem('plateNum'));
            this.tableFormatForm.patchValue({plateNum:+sessionStorage.getItem('plateNum')});
            this.tableFilters.set('plateNum',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('plateNum').value != '' && this.tableFormatForm.get('plateNum').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.plate === +this.tableFormatForm.get('plateNum').value);
            this.tableFilters.set('plateNum',true);
            this.resetTableButton = false;

            sessionStorage.setItem('plateNum', this.tableFormatForm.get('plateNum').value);
        }else{
            this.tableFilters.set('plateNum',false);
            sessionStorage.removeItem('plateNum');
        }

        //Apply Fiber Number Filter
        if(sessionStorage.getItem('fiberNum') != null && this.tableFormatForm.get('fiberNum').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.fiber === +sessionStorage.getItem('fiberNum'));
            this.tableFormatForm.patchValue({fiberNum:+sessionStorage.getItem('fiberNum')});
            this.tableFilters.set('fiberNum',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('fiberNum').value != '' && this.tableFormatForm.get('fiberNum').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.fiber === +this.tableFormatForm.get('fiberNum').value);
            this.tableFilters.set('fiberNum',true);
            this.resetTableButton = false;

            sessionStorage.setItem('fiberNum', this.tableFormatForm.get('fiberNum').value);
        }else{
            this.tableFilters.set('fiberNum',false);
            sessionStorage.removeItem('fiberNum');
        }

        //Apply Class Score Filter
        if(sessionStorage.getItem('classScore') != null && this.tableFormatForm.get('classScore').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.civ_class_score >= +sessionStorage.getItem('classScore'));
            this.tableFormatForm.patchValue({classScore:+sessionStorage.getItem('classScore')});
            this.tableFilters.set('classScore',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('classScore').value != '' && this.tableFormatForm.get('classScore').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.civ_class_score >= +this.tableFormatForm.get('classScore').value);
            this.tableFilters.set('classScore',true);
            this.resetTableButton = false;

            sessionStorage.setItem('classScore', this.tableFormatForm.get('classScore').value);
        }else{
            this.tableFilters.set('classScore',false);
            sessionStorage.removeItem('classScore');
        }

        //Apply the MgII Score Filter
        if(sessionStorage.getItem('mg2Score') != null && this.tableFormatForm.get('mg2Score').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.mgii_class_score >= +sessionStorage.getItem('mg2Score'));
            this.tableFormatForm.patchValue({mg2Score:+sessionStorage.getItem('mg2Score')});
            this.tableFilters.set('mg2Score',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('mg2Score').value != '' && this.tableFormatForm.get('mg2Score').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.mgii_class_score >= +this.tableFormatForm.get('mg2Score').value);
            this.tableFilters.set('mg2Score',true);
            this.resetTableButton = false;

            sessionStorage.setItem('mg2Score', this.tableFormatForm.get('mg2Score').value);
        }else{
            this.tableFilters.set('mg2Score',false);
            sessionStorage.removeItem('mg2Score');
        }

        //Apply the Other Score Filter
        if(sessionStorage.getItem('otherScore') != null && this.tableFormatForm.get('otherScore').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.other_class_score >= +sessionStorage.getItem('otherScore'));
            this.tableFormatForm.patchValue({otherScore:+sessionStorage.getItem('otherScore')});
            this.tableFilters.set('otherScore',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('otherScore').value != '' && this.tableFormatForm.get('otherScore').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.other_class_score >= +this.tableFormatForm.get('otherScore').value);
            this.tableFilters.set('otherScore',true);
            this.resetTableButton = false;

            sessionStorage.setItem('otherScore', this.tableFormatForm.get('otherScore').value);
        }else{
            this.tableFilters.set('otherScore',false);
            sessionStorage.removeItem('otherScore');
        }

        //Apply the minmum value of the Quasar Redshift Filter
        if(sessionStorage.getItem('qRedshiftStart') != null && this.tableFormatForm.get('qRedshiftStart').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.z_qso >= +sessionStorage.getItem('qRedshiftStart'));
            this.tableFormatForm.patchValue({qRedshiftStart:+sessionStorage.getItem('qRedshiftStart')});
            this.tableFilters.set('qRedshift',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('qRedshiftStart').value != '' && this.tableFormatForm.get('qRedshiftStart').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.z_qso >= +this.tableFormatForm.get('qRedshiftStart').value);
            this.tableFilters.set('qRedshift',true);
            this.resetTableButton = false;

            sessionStorage.setItem('qRedshiftStart', this.tableFormatForm.get('qRedshiftStart').value);
        }else{
            this.tableFilters.set('qRedshift',false);
            sessionStorage.removeItem('qRedshiftStart');
        }

        //Apply the maximum value of the Quasar Redshift Filter
        if(sessionStorage.getItem('qRedshiftEnd') != null && this.tableFormatForm.get('qRedshiftEnd').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.z_qso <= +sessionStorage.getItem('qRedshiftEnd'));
            this.tableFormatForm.patchValue({qRedshiftEnd:+sessionStorage.getItem('qRedshiftEnd')});
            this.tableFilters.set('qRedshift',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('qRedshiftEnd').value != '' && this.tableFormatForm.get('qRedshiftEnd').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.z_qso <= +this.tableFormatForm.get('qRedshiftEnd').value);
            this.tableFilters.set('qRedshift',true);
            this.resetTableButton = false;

            sessionStorage.setItem('qRedshiftEnd', this.tableFormatForm.get('qRedshiftEnd').value);
        }else{
            this.tableFilters.set('qRedshift',false);
            sessionStorage.removeItem('qRedshiftEnd');
        }

        //Apply filters of Absorber Redshift to table based on "Spectra with no detections" option
        if(this.tableFormatForm.get('noDetectionSpectra').value && this.tableFormatForm.get('noDetectionSpectra').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.z_abs == -1);
            this.tableFilters.set('aRedshift',true);
            this.resetTableButton = false;

            sessionStorage.setItem('noDetectionSpectra', this.tableFormatForm.get('noDetectionSpectra').value);
        }else if(sessionStorage.getItem('noDetectionSpectra') != null && this.tableFormatForm.get('noDetectionSpectra').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.z_abs == -1);
            this.tableFormatForm.patchValue({noDetectionSpectra:true});
            this.tableFilters.set('aRedshift',true);
            this.resetTableButton = false;

            this.tableFormatForm.get('aRedshiftStart').disable();
            this.tableFormatForm.get('aRedshiftEnd').disable();
        }else{
            this.tableFilters.set('aRedshift',false);
            sessionStorage.removeItem('noDetectionSpectra');

            //Apply the minmum value of the Absorber Redshift Filter
            if(sessionStorage.getItem('aRedshiftStart') != null && this.tableFormatForm.get('aRedshiftStart').value == null){
                this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.z_abs >= +sessionStorage.getItem('aRedshiftStart'));
                this.tableFormatForm.patchValue({aRedshiftStart:+sessionStorage.getItem('aRedshiftStart')});
                this.tableFilters.set('aRedshift',true);
                this.resetTableButton = false;
            }

            if(this.tableFormatForm.get('aRedshiftStart').value != '' && this.tableFormatForm.get('aRedshiftStart').value != null){
                this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.z_abs >= +this.tableFormatForm.get('aRedshiftStart').value);
                this.tableFilters.set('aRedshift',true);
                this.resetTableButton = false;

                sessionStorage.setItem('aRedshiftStart', this.tableFormatForm.get('aRedshiftStart').value);
            }else{
                this.tableFilters.set('aRedshift',false);
                sessionStorage.removeItem('aRedshiftStart');
            }

            //Apply the maximum value of the Absorber Redshift Filter
            if(sessionStorage.getItem('aRedshiftEnd') != null && this.tableFormatForm.get('aRedshiftEnd').value == null){
                this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.z_abs <= +sessionStorage.getItem('aRedshiftEnd'));
                this.tableFormatForm.patchValue({aRedshiftEnd:+sessionStorage.getItem('aRedshiftEnd')});
                this.tableFilters.set('aRedshift',true);
                this.resetTableButton = false;
            }

            if(this.tableFormatForm.get('aRedshiftEnd').value != '' && this.tableFormatForm.get('aRedshiftEnd').value != null){
                this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.z_abs <= +this.tableFormatForm.get('aRedshiftEnd').value);
                this.tableFilters.set('aRedshift',true);
                this.resetTableButton = false;

                sessionStorage.setItem('aRedshiftEnd', this.tableFormatForm.get('aRedshiftEnd').value);
            }else{
                this.tableFilters.set('aRedshift',false);
                sessionStorage.removeItem('aRedshiftEnd');
            }
        }


        //Apply the minmum value of the Ra Degree Filter
        if(sessionStorage.getItem('raDegStart') != null && this.tableFormatForm.get('raDegStart').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.ra_deg >= +sessionStorage.getItem('raDegStart'));
            this.tableFormatForm.patchValue({raDegStart:+sessionStorage.getItem('raDegStart')});
            this.tableFilters.set('raDeg',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('raDegStart').value != '' && this.tableFormatForm.get('raDegStart').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.ra_deg >= +this.tableFormatForm.get('raDegStart').value);
            this.tableFilters.set('raDeg',true);
            this.resetTableButton = false;

            sessionStorage.setItem('raDegStart', this.tableFormatForm.get('raDegStart').value);
        }else{
            this.tableFilters.set('raDeg',false);
            sessionStorage.removeItem('raDegStart');
        }

        //Apply the maximum value of the Ra Degree Filter
        if(sessionStorage.getItem('raDegEnd') != null && this.tableFormatForm.get('raDegEnd').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.ra_deg <= +sessionStorage.getItem('raDegEnd'));
            this.tableFormatForm.patchValue({raDegEnd:+sessionStorage.getItem('raDegEnd')});
            this.tableFilters.set('raDeg',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('raDegEnd').value != '' && this.tableFormatForm.get('raDegEnd').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.ra_deg <= +this.tableFormatForm.get('raDegEnd').value);
            this.tableFilters.set('raDeg',true);
            this.resetTableButton = false;

            sessionStorage.setItem('raDegEnd', this.tableFormatForm.get('raDegEnd').value);
        }else{
            this.tableFilters.set('raDeg',false);
            sessionStorage.removeItem('raDegEnd');
        }

        //Apply the minmum value of the Dec Degree Filter
        if(sessionStorage.getItem('decDegStart') != null && this.tableFormatForm.get('decDegStart').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.dec_deg >= +sessionStorage.getItem('decDegStart'));
            this.tableFormatForm.patchValue({decDegStart:+sessionStorage.getItem('decDegStart')});
            this.tableFilters.set('decDeg',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('decDegStart').value != '' && this.tableFormatForm.get('decDegStart').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.dec_deg >= +this.tableFormatForm.get('decDegStart').value);
            this.tableFilters.set('decDeg',true);
            this.resetTableButton = false;

            sessionStorage.setItem('decDegStart', this.tableFormatForm.get('decDegStart').value);
        }else{
            this.tableFilters.set('decDeg',false);
            sessionStorage.removeItem('decDegStart');
        }

        //Apply the maximum value of the Dec Degree Filter
        if(sessionStorage.getItem('decDegEnd') != null && this.tableFormatForm.get('decDegEnd').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.dec_deg <= +sessionStorage.getItem('decDegEnd'));
            this.tableFormatForm.patchValue({decDegEnd:+sessionStorage.getItem('decDegEnd')});
            this.tableFilters.set('decDeg',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('decDegEnd').value != '' && this.tableFormatForm.get('decDegEnd').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.dec_deg <= +this.tableFormatForm.get('decDegEnd').value);
            this.tableFilters.set('decDeg',true);
            this.resetTableButton = false;

            sessionStorage.setItem('decDegEnd', this.tableFormatForm.get('decDegEnd').value);
        }else{
            this.tableFilters.set('decDeg',false);
            sessionStorage.removeItem('decDegEnd');
        }

        //Apply the minmum value of the Imag Filter
        if(sessionStorage.getItem('imagStart') != null && this.tableFormatForm.get('imagStart').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.imag >= +sessionStorage.getItem('imagStart'));
            this.tableFormatForm.patchValue({imagStart:+sessionStorage.getItem('imagStart')});
            this.tableFilters.set('imag',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('imagStart').value != '' && this.tableFormatForm.get('imagStart').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.imag >= +this.tableFormatForm.get('imagStart').value);
            this.tableFilters.set('imag',true);
            this.resetTableButton = false;

            sessionStorage.setItem('imagStart', this.tableFormatForm.get('imagStart').value);
        }else{
            this.tableFilters.set('imag',false);
            sessionStorage.removeItem('imagStart');
        }

        //Apply the maximum value of the Imag Filter
        if(sessionStorage.getItem('imagEnd') != null && this.tableFormatForm.get('imagEnd').value == null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.imag <= +sessionStorage.getItem('imagEnd'));
            this.tableFormatForm.patchValue({imagEnd:+sessionStorage.getItem('imagEnd')});
            this.tableFilters.set('imag',true);
            this.resetTableButton = false;
        }

        if(this.tableFormatForm.get('imagEnd').value != '' && this.tableFormatForm.get('imagEnd').value != null){
            this.generalCatalogFiltered = this.generalCatalogFiltered.filter(data => data.imag <= +this.tableFormatForm.get('imagEnd').value);
            this.tableFilters.set('imag',true);
            this.resetTableButton = false;

            sessionStorage.setItem('imagEnd', this.tableFormatForm.get('imagEnd').value);
        }else{
            this.tableFilters.set('imag',false);
            sessionStorage.removeItem('imagEnd');
        }

        //Check if total results after filtering the table are less than one thousand
        if(this.generalCatalogFiltered.length <= 1000){
            this.lessThanOneThousandResults = true;
            this.nextDisable = true;
            this.entriesToDisplayEnd = this.generalCatalogFiltered.length;
        }else{
            this.lessThanOneThousandResults = false;
            this.entriesToDisplayEnd = 999;
        }

        this.entriesToDisplayStart = 0;
        this.prevDisable = true;
    }

    /**
     * Resets the table to the starting data set with no filters applied
     */
    onReset():void{
        //Resets catalog
        this.generalCatalogFiltered = this.generalCatalogComplete;
        
        this.lessThanOneThousandResults = false;

        //Resets the currently displayed entries
        this.entriesToDisplayEnd = 999;
        this.entriesToDisplayStart = 0;
        
        let keys = Array.from(this.tableFilters.keys());

        keys.forEach(key => {
            this.tableFilters.set(key, false);
        });

        //Enables the Absorber RedShift range inputs if the "Spectra with no detections" option was chosen
        this.tableFormatForm.get('aRedshiftStart').enable();
        this.tableFormatForm.get('aRedshiftEnd').enable();

        this.resetTableButton = true;
        this.prevDisable = true;
        this.nextDisable = false;

        sessionStorage.clear();
        
        this.tableFormatForm.reset();
    }
}