import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserEditPageRoutingModule } from './user-edit-routing.module';
import { UserEditPage } from './user-edit.page';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    UserEditPageRoutingModule
  ],
  declarations: [UserEditPage]
})
export class UserEditPageModule {}
