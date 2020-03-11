import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
// import { ChartsModule } from 'ng2-charts';
import { GoogleChartsModule } from 'angular-google-charts';

import { AppComponent } from './app.component';
import { TimeIntervallComponent } from './time-intervall-component/time-intervall-component';


@NgModule({
  declarations: [
    AppComponent,
    TimeIntervallComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    // ChartsModule,
    GoogleChartsModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
