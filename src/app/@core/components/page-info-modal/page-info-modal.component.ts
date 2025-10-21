import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

export interface ChartInfo {
  title: string;
  description: string;
}

export interface PageInfo {
  pageTitle: string;
  sections: {
    sectionTitle: string;
    charts: ChartInfo[];
  }[];
}

@Component({
  selector: 'ngx-page-info-modal',
  templateUrl: './page-info-modal.component.html',
  styleUrls: ['./page-info-modal.component.scss'],
})
export class PageInfoModalComponent implements OnInit {
  data: PageInfo = {
    pageTitle: 'Dashboard Information',
    sections: []
  };

  constructor(
    protected dialogRef: NbDialogRef<PageInfoModalComponent>,
  ) {}

  ngOnInit() {
    // Data will be set by the parent component after dialog opens
  }

  setData(data: PageInfo) {
    this.data = data;
  }

  close() {
    this.dialogRef.close();
  }
}
