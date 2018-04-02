import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { MemberAddComponent } from './member-add.component';
import {
  ButtonModule,
  IconModule,
  PopoverModule,
  InputModule,
  LabelModule,
  CheckboxModule
} from '@healthcatalyst/cashmere';
import { FormsModule } from '@angular/forms';
import { FabricExternalIdpSearchService, FabricAuthRoleService } from '../../../services';
import { FabricExternalIdpSearchServiceMock, mockExternalIdpSearchResult } from '../../../services/fabric-external-idp-search.service.mock';
import { ServicesMockModule } from './services.mock.module';
import { FabricAuthRoleServiceMock, mockRoles } from '../../../services/fabric-auth-role.service.mock';
import { Observable } from 'rxjs/Observable';
import { IdPSearchResult } from '../../../models';

describe('MemberAddComponent', () => {
  let component: MemberAddComponent;
  let fixture: ComponentFixture<MemberAddComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [MemberAddComponent],
        imports: [ServicesMockModule,
          FormsModule,
          ButtonModule,
          IconModule,
          PopoverModule,
          InputModule,
          LabelModule,
          CheckboxModule],
      }).compileComponents();
    })
  );

  beforeEach(inject([FabricAuthRoleService, FabricExternalIdpSearchService], (roleService: FabricAuthRoleServiceMock,
    idpSearch: FabricExternalIdpSearchServiceMock) => {
    roleService.getRolesBySecurableItemAndGrain.and.returnValue(Observable.of(mockRoles));
    idpSearch.searchUser.and.returnValue(Observable.of(mockExternalIdpSearchResult));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
