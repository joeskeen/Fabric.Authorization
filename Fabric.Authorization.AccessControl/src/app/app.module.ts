import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

 import { httpInterceptorProviders } from './services/interceptors';
import { AuthService } from '../app/services/global/auth.service';
import { AccessControlConfigService } from './services/access-control-config.service';
import { ClientAccessControlConfigService } from './services/global/client-access-control-config.service';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { LogoutComponent } from './logout/logout.component';

import { ButtonModule, ProgressIndicatorsModule } from '@healthcatalyst/cashmere';

@NgModule({
  declarations: [AppComponent, LoginComponent, HomeComponent, LogoutComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, ButtonModule, ProgressIndicatorsModule, BrowserAnimationsModule],
  providers: [
    AuthService,
    {
      provide: AccessControlConfigService,
      useClass: ClientAccessControlConfigService
    },
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
