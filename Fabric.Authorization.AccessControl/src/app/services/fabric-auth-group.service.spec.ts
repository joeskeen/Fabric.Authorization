import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { TestBed, inject, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import {
  FabricAuthGroupService,
  AccessControlConfigService
} from '../services';
import { IGroup, IUser, IRole } from '../models';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { FabricHttpErrorHandlerInterceptorService } from './interceptors/fabric-http-error-handler-interceptor.service';
import { mockUsersResponse, mockGroupResponse, mockRolesResponse } from './fabric-auth-group.service.mock';

describe('FabricAuthGroupService', () => {
  const groupName = 'DosAdminGroup';
  const groupSource = 'Custom';
  const grain = 'dos';
  const securableItem = 'datamart';
  const dosAdminRoleDisplayName = 'DOS Administrators (role)';
  const dosAdminRoleDescription = 'Administers DOS items (role)';
  const dosSuperUsersRoleDisplayName = 'DOS Super Users (role)';
  const dosSuperUsersRoleDescription = 'Elevated DOS privileges (role)';
  const dosAdminGroupDisplayName = 'DOS Administrators (group)';
  const dosAdminGroupDescription = 'Administers DOS items (group)';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FabricAuthGroupService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: FabricHttpErrorHandlerInterceptorService,
          multi: true
        },
        AccessControlConfigService
      ]
    });
  });

  it(
    'should be created',
    inject([FabricAuthGroupService], (service: FabricAuthGroupService) => {
      expect(service).toBeTruthy();
    })
  );

  it(
    'getGroupUsers should deserialize all properties',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          service.getGroupUsers(groupName).subscribe(returnedUser => {
            assertMockGroupUsersResponse(returnedUser);
          });

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/users`
          );
          expect(req.request.method).toBe('GET');
          req.flush(mockUsersResponse, { status: 200, statusText: 'OK' });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'getGroupUsers error should be caught',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          service
            .getGroupUsers(groupName)
            .catch(error => {
              expect(Observable.of(error)).toBeTruthy();
              expect(error.statusCode).toBe(404);
              expect(error.message).toBe('Group not found');
              return Observable.of(error);
            })
            .subscribe();

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/users`
          );
          expect(req.request.method).toBe('GET');
          req.flush(null, { status: 404, statusText: 'Group not found' });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'addUsersToCustomGroup should deserialize all properties',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          const userRequest: IUser = { identityProvider: 'idp', subjectId: 'sub123' };
          const userRequestArr: IUser[] = [userRequest];
          service
            .addUsersToCustomGroup(groupName, userRequestArr)
            .subscribe(returnedGroup => {
              assertMockGroupResponse(returnedGroup);
            });

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/users`
          );
          expect(req.request.method).toBe('POST');

          const requestBody = JSON.stringify(req.request.body);
          expect(requestBody).toBe(JSON.stringify(userRequestArr));
          req.flush(mockGroupResponse, { status: 201, statusText: 'Created' });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'addUsersToCustomGroup error should be caught',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          service
            .addUsersToCustomGroup(groupName, mockUsersResponse)
            .catch(error => {
              expect(Observable.of(error)).toBeTruthy();
              expect(error.statusCode).toBe(404);
              expect(error.message).toBe('Group not found');
              return Observable.of(error);
            })
            .subscribe();

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/users`
          );
          expect(req.request.method).toBe('POST');
          req.flush(null, { status: 404, statusText: 'Group not found' });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'removeUserFromCustomGroup should deserialize all properties',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          const user: IUser = { identityProvider: 'idp', subjectId: 'sub' };

          service
            .removeUserFromCustomGroup(groupName, user)
            .subscribe(returnedGroup => {
              assertMockGroupResponse(returnedGroup);
            });

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/users`
          );
          expect(req.request.method).toBe('DELETE');
          expect(req.request.body).toBeDefined();

          const requestBody = JSON.stringify(req.request.body);
          expect(requestBody).toBe(JSON.stringify(user));
          req.flush(mockGroupResponse, {
            status: 204,
            statusText: 'No Content'
          });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'removeUserFromCustomGroup error should be caught',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          service
            .removeUserFromCustomGroup(groupName, null)
            .catch(error => {
              expect(Observable.of(error)).toBeTruthy();
              expect(error.statusCode).toBe(404);
              expect(error.message).toBe('Group not found');
              return Observable.of(error);
            })
            .subscribe();

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/users`
          );
          expect(req.request.method).toBe('DELETE');
          req.flush(null, { status: 404, statusText: 'Group not found' });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'getGroupRoles should deserialize all properties',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          service.getGroupRoles(groupName, grain, securableItem).subscribe(returnedGroup => {
            assertMockGroupRolesResponse(returnedGroup);
          });

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/${encodeURI(grain)}/${encodeURI(securableItem)}/roles`
          );
          expect(req.request.method).toBe('GET');
          req.flush(mockRolesResponse, { status: 200, statusText: 'OK' });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'getGroupRoles error should be caught',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          service
            .getGroupRoles(groupName, grain, securableItem)
            .catch(error => {
              expect(Observable.of(error)).toBeTruthy();
              expect(error.statusCode).toBe(404);
              expect(error.message).toBe('Group not found');
              return Observable.of(error);
            })
            .subscribe();

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/${encodeURI(grain)}/${encodeURI(securableItem)}/roles`
          );
          expect(req.request.method).toBe('GET');
          req.flush(null, { status: 404, statusText: 'Group not found' });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'addRolesToGroup should deserialize all properties',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          service.addRolesToGroup(groupName, mockRolesResponse).subscribe(returnedGroup => {
            assertMockGroupResponse(returnedGroup);
          });

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/roles`
          );
          expect(req.request.method).toBe('POST');
          req.flush(mockGroupResponse, { status: 201, statusText: 'Created' });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'addRolesToGroup error should be caught',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          service
            .addRolesToGroup(groupName, mockRolesResponse)
            .catch(error => {
              expect(Observable.of(error)).toBeTruthy();
              expect(error.statusCode).toBe(404);
              expect(error.message).toBe('Group not found');
              return Observable.of(error);
            })
            .subscribe();

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/roles`
          );
          expect(req.request.method).toBe('POST');
          req.flush(null, { status: 404, statusText: 'Group not found' });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'removeRolesFromGroup should deserialize all properties',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          const role: IRole = { name: 'admin', grain: 'dos', securableItem: 'datamart' };
          role.parentRole = 'admin_parent';

          const roleArr = [role];

          service
            .removeRolesFromGroup(groupName, roleArr)
            .subscribe(returnedGroup => {
              assertMockGroupResponse(returnedGroup);
            });

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/roles`
          );
          expect(req.request.method).toBe('DELETE');
          expect(req.request.body).toBeDefined();

          const requestBody = JSON.stringify(req.request.body);
          expect(requestBody).toBe(
            JSON.stringify(
              roleArr.map(function (r) {
                return {
                  roleId: r.id
                };
              })
            )
          );

          req.flush(mockGroupResponse, {
            status: 204,
            statusText: 'No Content'
          });
          httpTestingController.verify();
        }
      )
    )
  );

  it(
    'removeRolesFromGroup error should be caught',
    async(
      inject(
        [HttpClient, HttpTestingController, FabricAuthGroupService],
        (
          httpClient: HttpClient,
          httpTestingController: HttpTestingController,
          service: FabricAuthGroupService
        ) => {
          service
            .removeRolesFromGroup(groupName, mockRolesResponse)
            .catch(error => {
              expect(Observable.of(error)).toBeTruthy();
              expect(error.statusCode).toBe(404);
              expect(error.message).toBe('Group not found');
              return Observable.of(error);
            })
            .subscribe();

          const req = httpTestingController.expectOne(
            `${FabricAuthGroupService.baseGroupApiUrl}/${encodeURI(groupName)}/roles`
          );
          expect(req.request.method).toBe('DELETE');
          req.flush(null, { status: 404, statusText: 'Group not found' });
          httpTestingController.verify();
        }
      )
    )
  );

  function assertMockGroupResponse(returnedGroup: IGroup) {
    expect(returnedGroup.groupName).toBe(groupName);
    expect(returnedGroup.groupSource).toBe(groupSource);
    expect(returnedGroup.displayName).toBe(dosAdminGroupDisplayName);
    expect(returnedGroup.description).toBe(dosAdminGroupDescription);
    assertMockGroupRolesResponse(returnedGroup.roles);
    assertMockGroupUsersResponse(returnedGroup.users);
  }

  function assertMockGroupRolesResponse(returnedRoles: IRole[]) {
    expect(returnedRoles).toBeDefined();
    expect(returnedRoles.length).toBe(2);

    const adminRole = returnedRoles[0];
    expect(adminRole.name).toBe('admin');
    expect(adminRole.displayName).toBe(dosAdminRoleDisplayName);
    expect(adminRole.description).toBe(dosAdminRoleDescription);
    expect(adminRole.grain).toBe('dos');
    expect(adminRole.securableItem).toBe('datamart');
    expect(adminRole.parentRole).toBe('admin_parent');

    const superUserRole = returnedRoles[1];
    expect(superUserRole.name).toBe('superuser');
    expect(superUserRole.displayName).toBe(dosSuperUsersRoleDisplayName);
    expect(superUserRole.description).toBe(dosSuperUsersRoleDescription);
    expect(superUserRole.grain).toBe('dos');
    expect(superUserRole.securableItem).toBe('datamart');
    expect(superUserRole.childRoles).toBeDefined();
    expect(superUserRole.childRoles.length).toBe(2);
    expect(superUserRole.childRoles[0]).toBe('dos_child1');
    expect(superUserRole.childRoles[1]).toBe('dos_child2');
  }

  function assertMockGroupUsersResponse(returnedUsers: IUser[]) {
    expect(returnedUsers).toBeDefined();
    expect(returnedUsers.length).toBe(1);

    const returnedUser = returnedUsers[0];
    expect(returnedUser.subjectId).toEqual('Sub123');
    expect(returnedUser.identityProvider).toEqual('Windows');
    expect(returnedUser.name).toEqual('First Last');
  }
});
