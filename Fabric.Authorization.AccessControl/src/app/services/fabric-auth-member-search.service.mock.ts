import { IAuthMemberSearchResponse, IAuthMemberSearchResult } from '../models';

export const mockAuthSearchResult: IAuthMemberSearchResponse = {
    totalCount: 2,
    results: [
        {
            subjectId: 'sub123',
            identityProvider: 'AD',
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last',
            groupName: 'Group 1',
            roles: [
                { name: 'admin', grain: 'app', securableItem: 'foo' },
                { name: 'superuser', grain: 'app', securableItem: 'foo' }
            ],
            entityType: 'User'
        },
        {
            subjectId: 'sub345',
            identityProvider: 'AD',
            firstName: 'First2',
            middleName: 'Middle2',
            lastName: 'Last2',
            groupName: 'Group 2',
            roles: [{ name: 'viewer', grain: 'app', securableItem: 'foo' }],
            entityType: 'CustomGroup'
        }
    ]
};

export class FabricAuthMemberSearchServiceMock {
    searchMembers: jasmine.Spy = jasmine.createSpy('searchMembers');
}
