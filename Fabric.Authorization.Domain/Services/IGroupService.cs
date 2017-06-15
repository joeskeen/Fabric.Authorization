﻿using System;
using System.Collections.Generic;
using Fabric.Authorization.Domain.Models;

namespace Fabric.Authorization.Domain.Services
{
    public interface IGroupService
    {
        IEnumerable<string> GetPermissionsForGroups(string[] groupNames, string grain = null, string securableItem = null);

        IEnumerable<Role> GetRolesForGroup(string groupName, string grain = null, string securableItem = null);

        void AddRoleToGroup(string groupName, Guid roledId);

        void DeleteRoleFromGroup(string groupName, Guid roleId);

        void AddGroup(Group group);
        Group GetGroup(string groupName);
        void DeleteGroup(string groupName);
    }
}
