﻿using Fabric.Authorization.Domain.Models;
using FluentValidation;

namespace Fabric.Authorization.Domain.Validators
{
    public class SecurableItemValidator : AbstractValidator<SecurableItem>
    {
        public SecurableItemValidator()
        {
            ConfigureRules();
        }

        private void ConfigureRules()
        {
            RuleFor(item => item.Name)
                .NotEmpty()
                .WithMessage("Please specify a Name for the SecurableItem.")
                .WithState(s => ValidationEnums.ValidationState.MissingRequiredField);
        }
    }
}