import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

/**
 * Google Sheets Configuration Component
 * Handles Google Sheets integration settings for Screening and GoAML
 */
@Component({
  selector: 'ngx-google-sheets-config',
  templateUrl: './google-sheets-config.component.html',
  styleUrls: ['./google-sheets-config.component.scss'],
})
export class GoogleSheetsConfigComponent implements OnInit {
  loading = false;
  screeningConfig: FormGroup;
  goamlConfig: FormGroup;
  testResults: { [key: string]: any } = {};

  // Screening page fields (based on Screening interface)
  screeningFields = [
    'detection_date',
    'detection_id',
    'MSISDN',
    'status',
    'investigator',
    'screening_type',
    'wallet_creation_date',
    'alert_creation_date',
    'auto_processed_date',
    'manual_processed_date',
    'rejection_reason',
    'screening_source',
  ];

  // GoAML Reports page fields (based on GoAmlReport interface)
  goamlFields = [
    'report_id',
    'submitted_at',
    'report_type',
    'submitted_by',
    'status',
    'reason',
    'wallet_type',
    'source',
  ];

  // Keep availableFields for backward compatibility (defaults to screening fields)
  availableFields = this.screeningFields;

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  private initializeForms(): void {
    this.screeningConfig = this.fb.group({
      sheetId: ['', Validators.required],
      serviceAccountCredentials: ['', Validators.required],
      columnMappings: this.fb.array([]),
    });

    this.goamlConfig = this.fb.group({
      sheetId: ['', Validators.required],
      serviceAccountCredentials: ['', Validators.required],
      columnMappings: this.fb.array([]),
    });
  }

  loadConfiguration(): void {
    this.loading = true;
    // TODO: Load configuration from backend
    setTimeout(() => {
      // Mock data
      this.screeningConfig.patchValue({
        sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        serviceAccountCredentials: '{"type": "service_account", "project_id": "..."}',
      });

      this.goamlConfig.patchValue({
        sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        serviceAccountCredentials: '{"type": "service_account", "project_id": "..."}',
      });

      // Add some default column mappings
      this.addColumnMapping('screening');
      this.addColumnMapping('goaml');

      this.loading = false;
    }, 1000);
  }

  getColumnMappings(formGroup: string): FormArray {
    const config = formGroup === 'screening' ? this.screeningConfig : this.goamlConfig;
    return config.get('columnMappings') as FormArray;
  }

  addColumnMapping(formGroup: string): void {
    const mappings = this.getColumnMappings(formGroup);
    mappings.push(this.fb.group({
      columnIndex: ['', Validators.required],
      dashboardField: ['', Validators.required],
    }));
  }

  removeColumnMapping(formGroup: string, index: number): void {
    const mappings = this.getColumnMappings(formGroup);
    mappings.removeAt(index);
  }

  testConnection(formGroup: string): void {
    const config = formGroup === 'screening' ? this.screeningConfig : this.goamlConfig;
    
    if (config.valid) {
      this.loading = true;
      console.log('Testing connection for:', formGroup, config.value);
      
      // TODO: Implement API call to test connection
      setTimeout(() => {
        this.testResults[formGroup] = {
          success: true,
          message: 'Connection successful!',
        };
        this.loading = false;
      }, 2000);
    }
  }

  saveConfiguration(formGroup: string): void {
    const config = formGroup === 'screening' ? this.screeningConfig : this.goamlConfig;
    
    if (config.valid) {
      console.log('Saving configuration for:', formGroup, config.value);
      // TODO: Implement API call to save configuration
      alert(`${formGroup} configuration saved successfully!`);
    }
  }

  getTestResult(formGroup: string): any {
    return this.testResults[formGroup];
  }

  /**
   * Get available fields for a specific sheet type
   */
  getAvailableFields(sheetType: string): string[] {
    return sheetType === 'screening' ? this.screeningFields : this.goamlFields;
  }
}
