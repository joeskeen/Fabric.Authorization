﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Fabric.Authorization.Domain.Exceptions
{
    public class PermissionAlreadyExistsException : Exception
    {
        public PermissionAlreadyExistsException()
        {
        }

        public PermissionAlreadyExistsException(string message) : base(message)
        {
        }

        public PermissionAlreadyExistsException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}