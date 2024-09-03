import type { Prisma } from '@prisma/client';
import { z } from 'zod';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserRoleScalarFieldEnumSchema = z.enum(['id','role','userId']);

export const UserPermissionScalarFieldEnumSchema = z.enum(['id','permission','userId']);

export const UserScalarFieldEnumSchema = z.enum(['id','firstName','lastName','imageUrl','createdAt','updatedAt']);

export const EmailAddressScalarFieldEnumSchema = z.enum(['id','emailAddress','isPrimary','verification','userId']);

export const ExternalAccountScalarFieldEnumSchema = z.enum(['id','provider','externalId','userId']);

export const ListingScalarFieldEnumSchema = z.enum(['id','title','description','propertyType','address','city','state','zipCode','amenities','pricePerNight','minimumStay','maximumGuests','houseRules','published','ownerId','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const PermissionSchema = z.enum(['MANAGE_LISTINGS','READ_MEMBERS','MANAGE_BILLING','VIEW_REPORTS','EDIT_SETTINGS','MANAGE_DOMAINS','MANAGE_ORGANIZATION','DELETE_ORGANIZATION','MANAGE_MEMBERS','MANAGE_USERS','MANAGE_ROLES','MANAGE_PERMISSIONS']);

export type PermissionType = `${z.infer<typeof PermissionSchema>}`

export const RoleSchema = z.enum(['ADMIN','HOST','COHOST','GUEST']);

export type RoleType = `${z.infer<typeof RoleSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER ROLE SCHEMA
/////////////////////////////////////////

export const UserRoleSchema = z.object({
  role: RoleSchema,
  id: z.number().int(),
  userId: z.string(),
})

export type UserRole = z.infer<typeof UserRoleSchema>

/////////////////////////////////////////
// USER PERMISSION SCHEMA
/////////////////////////////////////////

export const UserPermissionSchema = z.object({
  permission: PermissionSchema,
  id: z.number().int(),
  userId: z.string(),
})

export type UserPermission = z.infer<typeof UserPermissionSchema>

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// EMAIL ADDRESS SCHEMA
/////////////////////////////////////////

export const EmailAddressSchema = z.object({
  id: z.string(),
  emailAddress: z.string(),
  isPrimary: z.boolean(),
  verification: z.string().nullable(),
  userId: z.string(),
})

export type EmailAddress = z.infer<typeof EmailAddressSchema>

/////////////////////////////////////////
// EXTERNAL ACCOUNT SCHEMA
/////////////////////////////////////////

export const ExternalAccountSchema = z.object({
  id: z.string(),
  provider: z.string(),
  externalId: z.string(),
  userId: z.string(),
})

export type ExternalAccount = z.infer<typeof ExternalAccountSchema>

/////////////////////////////////////////
// LISTING SCHEMA
/////////////////////////////////////////

export const ListingSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  propertyType: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  amenities: z.string().array(),
  pricePerNight: z.number(),
  minimumStay: z.number().int(),
  maximumGuests: z.number().int(),
  houseRules: z.string(),
  published: z.boolean(),
  ownerId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Listing = z.infer<typeof ListingSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER ROLE
//------------------------------------------------------

export const UserRoleIncludeSchema: z.ZodType<Prisma.UserRoleInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserRoleArgsSchema: z.ZodType<Prisma.UserRoleDefaultArgs> = z.object({
  select: z.lazy(() => UserRoleSelectSchema).optional(),
  include: z.lazy(() => UserRoleIncludeSchema).optional(),
}).strict();

export const UserRoleSelectSchema: z.ZodType<Prisma.UserRoleSelect> = z.object({
  id: z.boolean().optional(),
  role: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER PERMISSION
//------------------------------------------------------

export const UserPermissionIncludeSchema: z.ZodType<Prisma.UserPermissionInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserPermissionArgsSchema: z.ZodType<Prisma.UserPermissionDefaultArgs> = z.object({
  select: z.lazy(() => UserPermissionSelectSchema).optional(),
  include: z.lazy(() => UserPermissionIncludeSchema).optional(),
}).strict();

export const UserPermissionSelectSchema: z.ZodType<Prisma.UserPermissionSelect> = z.object({
  id: z.boolean().optional(),
  permission: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  emailAddresses: z.union([z.boolean(),z.lazy(() => EmailAddressFindManyArgsSchema)]).optional(),
  externalAccounts: z.union([z.boolean(),z.lazy(() => ExternalAccountFindManyArgsSchema)]).optional(),
  listings: z.union([z.boolean(),z.lazy(() => ListingFindManyArgsSchema)]).optional(),
  roles: z.union([z.boolean(),z.lazy(() => UserRoleFindManyArgsSchema)]).optional(),
  permissions: z.union([z.boolean(),z.lazy(() => UserPermissionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  emailAddresses: z.boolean().optional(),
  externalAccounts: z.boolean().optional(),
  listings: z.boolean().optional(),
  roles: z.boolean().optional(),
  permissions: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  imageUrl: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  emailAddresses: z.union([z.boolean(),z.lazy(() => EmailAddressFindManyArgsSchema)]).optional(),
  externalAccounts: z.union([z.boolean(),z.lazy(() => ExternalAccountFindManyArgsSchema)]).optional(),
  listings: z.union([z.boolean(),z.lazy(() => ListingFindManyArgsSchema)]).optional(),
  roles: z.union([z.boolean(),z.lazy(() => UserRoleFindManyArgsSchema)]).optional(),
  permissions: z.union([z.boolean(),z.lazy(() => UserPermissionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// EMAIL ADDRESS
//------------------------------------------------------

export const EmailAddressIncludeSchema: z.ZodType<Prisma.EmailAddressInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const EmailAddressArgsSchema: z.ZodType<Prisma.EmailAddressDefaultArgs> = z.object({
  select: z.lazy(() => EmailAddressSelectSchema).optional(),
  include: z.lazy(() => EmailAddressIncludeSchema).optional(),
}).strict();

export const EmailAddressSelectSchema: z.ZodType<Prisma.EmailAddressSelect> = z.object({
  id: z.boolean().optional(),
  emailAddress: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
  verification: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// EXTERNAL ACCOUNT
//------------------------------------------------------

export const ExternalAccountIncludeSchema: z.ZodType<Prisma.ExternalAccountInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const ExternalAccountArgsSchema: z.ZodType<Prisma.ExternalAccountDefaultArgs> = z.object({
  select: z.lazy(() => ExternalAccountSelectSchema).optional(),
  include: z.lazy(() => ExternalAccountIncludeSchema).optional(),
}).strict();

export const ExternalAccountSelectSchema: z.ZodType<Prisma.ExternalAccountSelect> = z.object({
  id: z.boolean().optional(),
  provider: z.boolean().optional(),
  externalId: z.boolean().optional(),
  userId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// LISTING
//------------------------------------------------------

export const ListingIncludeSchema: z.ZodType<Prisma.ListingInclude> = z.object({
  owner: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const ListingArgsSchema: z.ZodType<Prisma.ListingDefaultArgs> = z.object({
  select: z.lazy(() => ListingSelectSchema).optional(),
  include: z.lazy(() => ListingIncludeSchema).optional(),
}).strict();

export const ListingSelectSchema: z.ZodType<Prisma.ListingSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  propertyType: z.boolean().optional(),
  address: z.boolean().optional(),
  city: z.boolean().optional(),
  state: z.boolean().optional(),
  zipCode: z.boolean().optional(),
  amenities: z.boolean().optional(),
  pricePerNight: z.boolean().optional(),
  minimumStay: z.boolean().optional(),
  maximumGuests: z.boolean().optional(),
  houseRules: z.boolean().optional(),
  published: z.boolean().optional(),
  ownerId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  owner: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserRoleWhereInputSchema: z.ZodType<Prisma.UserRoleWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserRoleWhereInputSchema),z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleWhereInputSchema),z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserRoleOrderByWithRelationInputSchema: z.ZodType<Prisma.UserRoleOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const UserRoleWhereUniqueInputSchema: z.ZodType<Prisma.UserRoleWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    userId_role: z.lazy(() => UserRoleUserIdRoleCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    userId_role: z.lazy(() => UserRoleUserIdRoleCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  userId_role: z.lazy(() => UserRoleUserIdRoleCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => UserRoleWhereInputSchema),z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleWhereInputSchema),z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserRoleOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserRoleOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserRoleCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserRoleAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserRoleMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserRoleMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserRoleSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserRoleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserRoleScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema),z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema),z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleWithAggregatesFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UserPermissionWhereInputSchema: z.ZodType<Prisma.UserPermissionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserPermissionWhereInputSchema),z.lazy(() => UserPermissionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserPermissionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserPermissionWhereInputSchema),z.lazy(() => UserPermissionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  permission: z.union([ z.lazy(() => EnumPermissionFilterSchema),z.lazy(() => PermissionSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserPermissionOrderByWithRelationInputSchema: z.ZodType<Prisma.UserPermissionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  permission: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const UserPermissionWhereUniqueInputSchema: z.ZodType<Prisma.UserPermissionWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    userId_permission: z.lazy(() => UserPermissionUserIdPermissionCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    userId_permission: z.lazy(() => UserPermissionUserIdPermissionCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.number().int().optional(),
  userId_permission: z.lazy(() => UserPermissionUserIdPermissionCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => UserPermissionWhereInputSchema),z.lazy(() => UserPermissionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserPermissionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserPermissionWhereInputSchema),z.lazy(() => UserPermissionWhereInputSchema).array() ]).optional(),
  permission: z.union([ z.lazy(() => EnumPermissionFilterSchema),z.lazy(() => PermissionSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserPermissionOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserPermissionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  permission: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserPermissionCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserPermissionAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserPermissionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserPermissionMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserPermissionSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserPermissionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserPermissionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserPermissionScalarWhereWithAggregatesInputSchema),z.lazy(() => UserPermissionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserPermissionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserPermissionScalarWhereWithAggregatesInputSchema),z.lazy(() => UserPermissionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  permission: z.union([ z.lazy(() => EnumPermissionWithAggregatesFilterSchema),z.lazy(() => PermissionSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressListRelationFilterSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountListRelationFilterSchema).optional(),
  listings: z.lazy(() => ListingListRelationFilterSchema).optional(),
  roles: z.lazy(() => UserRoleListRelationFilterSchema).optional(),
  permissions: z.lazy(() => UserPermissionListRelationFilterSchema).optional()
}).strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  imageUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  emailAddresses: z.lazy(() => EmailAddressOrderByRelationAggregateInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountOrderByRelationAggregateInputSchema).optional(),
  listings: z.lazy(() => ListingOrderByRelationAggregateInputSchema).optional(),
  roles: z.lazy(() => UserRoleOrderByRelationAggregateInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionOrderByRelationAggregateInputSchema).optional()
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.object({
  id: z.string()
})
.and(z.object({
  id: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  firstName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressListRelationFilterSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountListRelationFilterSchema).optional(),
  listings: z.lazy(() => ListingListRelationFilterSchema).optional(),
  roles: z.lazy(() => UserRoleListRelationFilterSchema).optional(),
  permissions: z.lazy(() => UserPermissionListRelationFilterSchema).optional()
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  imageUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional()
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  lastName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  imageUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const EmailAddressWhereInputSchema: z.ZodType<Prisma.EmailAddressWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EmailAddressWhereInputSchema),z.lazy(() => EmailAddressWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmailAddressWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmailAddressWhereInputSchema),z.lazy(() => EmailAddressWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emailAddress: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isPrimary: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  verification: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const EmailAddressOrderByWithRelationInputSchema: z.ZodType<Prisma.EmailAddressOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  emailAddress: z.lazy(() => SortOrderSchema).optional(),
  isPrimary: z.lazy(() => SortOrderSchema).optional(),
  verification: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const EmailAddressWhereUniqueInputSchema: z.ZodType<Prisma.EmailAddressWhereUniqueInput> = z.union([
  z.object({
    id: z.string(),
    emailAddress: z.string()
  }),
  z.object({
    id: z.string(),
  }),
  z.object({
    emailAddress: z.string(),
  }),
])
.and(z.object({
  id: z.string().optional(),
  emailAddress: z.string().optional(),
  AND: z.union([ z.lazy(() => EmailAddressWhereInputSchema),z.lazy(() => EmailAddressWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmailAddressWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmailAddressWhereInputSchema),z.lazy(() => EmailAddressWhereInputSchema).array() ]).optional(),
  isPrimary: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  verification: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const EmailAddressOrderByWithAggregationInputSchema: z.ZodType<Prisma.EmailAddressOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  emailAddress: z.lazy(() => SortOrderSchema).optional(),
  isPrimary: z.lazy(() => SortOrderSchema).optional(),
  verification: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => EmailAddressCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => EmailAddressMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => EmailAddressMinOrderByAggregateInputSchema).optional()
}).strict();

export const EmailAddressScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EmailAddressScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => EmailAddressScalarWhereWithAggregatesInputSchema),z.lazy(() => EmailAddressScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmailAddressScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmailAddressScalarWhereWithAggregatesInputSchema),z.lazy(() => EmailAddressScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  emailAddress: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isPrimary: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  verification: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const ExternalAccountWhereInputSchema: z.ZodType<Prisma.ExternalAccountWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ExternalAccountWhereInputSchema),z.lazy(() => ExternalAccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExternalAccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExternalAccountWhereInputSchema),z.lazy(() => ExternalAccountWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  externalId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const ExternalAccountOrderByWithRelationInputSchema: z.ZodType<Prisma.ExternalAccountOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  externalId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const ExternalAccountWhereUniqueInputSchema: z.ZodType<Prisma.ExternalAccountWhereUniqueInput> = z.union([
  z.object({
    id: z.string(),
    provider_externalId: z.lazy(() => ExternalAccountProviderExternalIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string(),
  }),
  z.object({
    provider_externalId: z.lazy(() => ExternalAccountProviderExternalIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().optional(),
  provider_externalId: z.lazy(() => ExternalAccountProviderExternalIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ExternalAccountWhereInputSchema),z.lazy(() => ExternalAccountWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExternalAccountWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExternalAccountWhereInputSchema),z.lazy(() => ExternalAccountWhereInputSchema).array() ]).optional(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  externalId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const ExternalAccountOrderByWithAggregationInputSchema: z.ZodType<Prisma.ExternalAccountOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  externalId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ExternalAccountCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ExternalAccountMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ExternalAccountMinOrderByAggregateInputSchema).optional()
}).strict();

export const ExternalAccountScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ExternalAccountScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ExternalAccountScalarWhereWithAggregatesInputSchema),z.lazy(() => ExternalAccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExternalAccountScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExternalAccountScalarWhereWithAggregatesInputSchema),z.lazy(() => ExternalAccountScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  provider: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  externalId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const ListingWhereInputSchema: z.ZodType<Prisma.ListingWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ListingWhereInputSchema),z.lazy(() => ListingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingWhereInputSchema),z.lazy(() => ListingWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  propertyType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  city: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  state: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  zipCode: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amenities: z.lazy(() => StringNullableListFilterSchema).optional(),
  pricePerNight: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  minimumStay: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  maximumGuests: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  houseRules: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  published: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  owner: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const ListingOrderByWithRelationInputSchema: z.ZodType<Prisma.ListingOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  propertyType: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  city: z.lazy(() => SortOrderSchema).optional(),
  state: z.lazy(() => SortOrderSchema).optional(),
  zipCode: z.lazy(() => SortOrderSchema).optional(),
  amenities: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  houseRules: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  owner: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const ListingWhereUniqueInputSchema: z.ZodType<Prisma.ListingWhereUniqueInput> = z.object({
  id: z.number().int()
})
.and(z.object({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => ListingWhereInputSchema),z.lazy(() => ListingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingWhereInputSchema),z.lazy(() => ListingWhereInputSchema).array() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  propertyType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  city: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  state: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  zipCode: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amenities: z.lazy(() => StringNullableListFilterSchema).optional(),
  pricePerNight: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  minimumStay: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  maximumGuests: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  houseRules: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  published: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  owner: z.union([ z.lazy(() => UserRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const ListingOrderByWithAggregationInputSchema: z.ZodType<Prisma.ListingOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  propertyType: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  city: z.lazy(() => SortOrderSchema).optional(),
  state: z.lazy(() => SortOrderSchema).optional(),
  zipCode: z.lazy(() => SortOrderSchema).optional(),
  amenities: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  houseRules: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ListingCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ListingAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ListingMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ListingMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ListingSumOrderByAggregateInputSchema).optional()
}).strict();

export const ListingScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ListingScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ListingScalarWhereWithAggregatesInputSchema),z.lazy(() => ListingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingScalarWhereWithAggregatesInputSchema),z.lazy(() => ListingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  propertyType: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  city: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  state: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  zipCode: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  amenities: z.lazy(() => StringNullableListFilterSchema).optional(),
  pricePerNight: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema),z.number() ]).optional(),
  minimumStay: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  maximumGuests: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  houseRules: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  published: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserRoleCreateInputSchema: z.ZodType<Prisma.UserRoleCreateInput> = z.object({
  role: z.lazy(() => RoleSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutRolesInputSchema)
}).strict();

export const UserRoleUncheckedCreateInputSchema: z.ZodType<Prisma.UserRoleUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  role: z.lazy(() => RoleSchema),
  userId: z.string()
}).strict();

export const UserRoleUpdateInputSchema: z.ZodType<Prisma.UserRoleUpdateInput> = z.object({
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutRolesNestedInputSchema).optional()
}).strict();

export const UserRoleUncheckedUpdateInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleCreateManyInputSchema: z.ZodType<Prisma.UserRoleCreateManyInput> = z.object({
  id: z.number().int().optional(),
  role: z.lazy(() => RoleSchema),
  userId: z.string()
}).strict();

export const UserRoleUpdateManyMutationInputSchema: z.ZodType<Prisma.UserRoleUpdateManyMutationInput> = z.object({
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionCreateInputSchema: z.ZodType<Prisma.UserPermissionCreateInput> = z.object({
  permission: z.lazy(() => PermissionSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutPermissionsInputSchema)
}).strict();

export const UserPermissionUncheckedCreateInputSchema: z.ZodType<Prisma.UserPermissionUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  permission: z.lazy(() => PermissionSchema),
  userId: z.string()
}).strict();

export const UserPermissionUpdateInputSchema: z.ZodType<Prisma.UserPermissionUpdateInput> = z.object({
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutPermissionsNestedInputSchema).optional()
}).strict();

export const UserPermissionUncheckedUpdateInputSchema: z.ZodType<Prisma.UserPermissionUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionCreateManyInputSchema: z.ZodType<Prisma.UserPermissionCreateManyInput> = z.object({
  id: z.number().int().optional(),
  permission: z.lazy(() => PermissionSchema),
  userId: z.string()
}).strict();

export const UserPermissionUpdateManyMutationInputSchema: z.ZodType<Prisma.UserPermissionUpdateManyMutationInput> = z.object({
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserPermissionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EmailAddressCreateInputSchema: z.ZodType<Prisma.EmailAddressCreateInput> = z.object({
  id: z.string(),
  emailAddress: z.string(),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutEmailAddressesInputSchema)
}).strict();

export const EmailAddressUncheckedCreateInputSchema: z.ZodType<Prisma.EmailAddressUncheckedCreateInput> = z.object({
  id: z.string(),
  emailAddress: z.string(),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable(),
  userId: z.string()
}).strict();

export const EmailAddressUpdateInputSchema: z.ZodType<Prisma.EmailAddressUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutEmailAddressesNestedInputSchema).optional()
}).strict();

export const EmailAddressUncheckedUpdateInputSchema: z.ZodType<Prisma.EmailAddressUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const EmailAddressCreateManyInputSchema: z.ZodType<Prisma.EmailAddressCreateManyInput> = z.object({
  id: z.string(),
  emailAddress: z.string(),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable(),
  userId: z.string()
}).strict();

export const EmailAddressUpdateManyMutationInputSchema: z.ZodType<Prisma.EmailAddressUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const EmailAddressUncheckedUpdateManyInputSchema: z.ZodType<Prisma.EmailAddressUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountCreateInputSchema: z.ZodType<Prisma.ExternalAccountCreateInput> = z.object({
  id: z.string(),
  provider: z.string(),
  externalId: z.string(),
  user: z.lazy(() => UserCreateNestedOneWithoutExternalAccountsInputSchema)
}).strict();

export const ExternalAccountUncheckedCreateInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedCreateInput> = z.object({
  id: z.string(),
  provider: z.string(),
  externalId: z.string(),
  userId: z.string()
}).strict();

export const ExternalAccountUpdateInputSchema: z.ZodType<Prisma.ExternalAccountUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutExternalAccountsNestedInputSchema).optional()
}).strict();

export const ExternalAccountUncheckedUpdateInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountCreateManyInputSchema: z.ZodType<Prisma.ExternalAccountCreateManyInput> = z.object({
  id: z.string(),
  provider: z.string(),
  externalId: z.string(),
  userId: z.string()
}).strict();

export const ExternalAccountUpdateManyMutationInputSchema: z.ZodType<Prisma.ExternalAccountUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingCreateInputSchema: z.ZodType<Prisma.ListingCreateInput> = z.object({
  title: z.string(),
  description: z.string(),
  propertyType: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number(),
  minimumStay: z.number().int().optional(),
  maximumGuests: z.number().int().optional(),
  houseRules: z.string(),
  published: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  owner: z.lazy(() => UserCreateNestedOneWithoutListingsInputSchema)
}).strict();

export const ListingUncheckedCreateInputSchema: z.ZodType<Prisma.ListingUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string(),
  propertyType: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number(),
  minimumStay: z.number().int().optional(),
  maximumGuests: z.number().int().optional(),
  houseRules: z.string(),
  published: z.boolean().optional(),
  ownerId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ListingUpdateInputSchema: z.ZodType<Prisma.ListingUpdateInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  city: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  zipCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  owner: z.lazy(() => UserUpdateOneRequiredWithoutListingsNestedInputSchema).optional()
}).strict();

export const ListingUncheckedUpdateInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  city: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  zipCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingCreateManyInputSchema: z.ZodType<Prisma.ListingCreateManyInput> = z.object({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string(),
  propertyType: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number(),
  minimumStay: z.number().int().optional(),
  maximumGuests: z.number().int().optional(),
  houseRules: z.string(),
  published: z.boolean().optional(),
  ownerId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ListingUpdateManyMutationInputSchema: z.ZodType<Prisma.ListingUpdateManyMutationInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  city: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  zipCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  city: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  zipCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  ownerId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const EnumRoleFilterSchema: z.ZodType<Prisma.EnumRoleFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleFilterSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const UserRelationFilterSchema: z.ZodType<Prisma.UserRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserRoleUserIdRoleCompoundUniqueInputSchema: z.ZodType<Prisma.UserRoleUserIdRoleCompoundUniqueInput> = z.object({
  userId: z.string(),
  role: z.lazy(() => RoleSchema)
}).strict();

export const UserRoleCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRoleAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRoleMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRoleMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRoleSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const EnumRoleWithAggregatesFilterSchema: z.ZodType<Prisma.EnumRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoleFilterSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const EnumPermissionFilterSchema: z.ZodType<Prisma.EnumPermissionFilter> = z.object({
  equals: z.lazy(() => PermissionSchema).optional(),
  in: z.lazy(() => PermissionSchema).array().optional(),
  notIn: z.lazy(() => PermissionSchema).array().optional(),
  not: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => NestedEnumPermissionFilterSchema) ]).optional(),
}).strict();

export const UserPermissionUserIdPermissionCompoundUniqueInputSchema: z.ZodType<Prisma.UserPermissionUserIdPermissionCompoundUniqueInput> = z.object({
  userId: z.string(),
  permission: z.lazy(() => PermissionSchema)
}).strict();

export const UserPermissionCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserPermissionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  permission: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserPermissionAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserPermissionAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserPermissionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserPermissionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  permission: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserPermissionMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserPermissionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  permission: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserPermissionSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserPermissionSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumPermissionWithAggregatesFilterSchema: z.ZodType<Prisma.EnumPermissionWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PermissionSchema).optional(),
  in: z.lazy(() => PermissionSchema).array().optional(),
  notIn: z.lazy(() => PermissionSchema).array().optional(),
  not: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => NestedEnumPermissionWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPermissionFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPermissionFilterSchema).optional()
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const EmailAddressListRelationFilterSchema: z.ZodType<Prisma.EmailAddressListRelationFilter> = z.object({
  every: z.lazy(() => EmailAddressWhereInputSchema).optional(),
  some: z.lazy(() => EmailAddressWhereInputSchema).optional(),
  none: z.lazy(() => EmailAddressWhereInputSchema).optional()
}).strict();

export const ExternalAccountListRelationFilterSchema: z.ZodType<Prisma.ExternalAccountListRelationFilter> = z.object({
  every: z.lazy(() => ExternalAccountWhereInputSchema).optional(),
  some: z.lazy(() => ExternalAccountWhereInputSchema).optional(),
  none: z.lazy(() => ExternalAccountWhereInputSchema).optional()
}).strict();

export const ListingListRelationFilterSchema: z.ZodType<Prisma.ListingListRelationFilter> = z.object({
  every: z.lazy(() => ListingWhereInputSchema).optional(),
  some: z.lazy(() => ListingWhereInputSchema).optional(),
  none: z.lazy(() => ListingWhereInputSchema).optional()
}).strict();

export const UserRoleListRelationFilterSchema: z.ZodType<Prisma.UserRoleListRelationFilter> = z.object({
  every: z.lazy(() => UserRoleWhereInputSchema).optional(),
  some: z.lazy(() => UserRoleWhereInputSchema).optional(),
  none: z.lazy(() => UserRoleWhereInputSchema).optional()
}).strict();

export const UserPermissionListRelationFilterSchema: z.ZodType<Prisma.UserPermissionListRelationFilter> = z.object({
  every: z.lazy(() => UserPermissionWhereInputSchema).optional(),
  some: z.lazy(() => UserPermissionWhereInputSchema).optional(),
  none: z.lazy(() => UserPermissionWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const EmailAddressOrderByRelationAggregateInputSchema: z.ZodType<Prisma.EmailAddressOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExternalAccountOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ExternalAccountOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ListingOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserRoleOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserRoleOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserPermissionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserPermissionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  imageUrl: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const EmailAddressCountOrderByAggregateInputSchema: z.ZodType<Prisma.EmailAddressCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  emailAddress: z.lazy(() => SortOrderSchema).optional(),
  isPrimary: z.lazy(() => SortOrderSchema).optional(),
  verification: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EmailAddressMaxOrderByAggregateInputSchema: z.ZodType<Prisma.EmailAddressMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  emailAddress: z.lazy(() => SortOrderSchema).optional(),
  isPrimary: z.lazy(() => SortOrderSchema).optional(),
  verification: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EmailAddressMinOrderByAggregateInputSchema: z.ZodType<Prisma.EmailAddressMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  emailAddress: z.lazy(() => SortOrderSchema).optional(),
  isPrimary: z.lazy(() => SortOrderSchema).optional(),
  verification: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const ExternalAccountProviderExternalIdCompoundUniqueInputSchema: z.ZodType<Prisma.ExternalAccountProviderExternalIdCompoundUniqueInput> = z.object({
  provider: z.string(),
  externalId: z.string()
}).strict();

export const ExternalAccountCountOrderByAggregateInputSchema: z.ZodType<Prisma.ExternalAccountCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  externalId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExternalAccountMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ExternalAccountMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  externalId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ExternalAccountMinOrderByAggregateInputSchema: z.ZodType<Prisma.ExternalAccountMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  provider: z.lazy(() => SortOrderSchema).optional(),
  externalId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const FloatFilterSchema: z.ZodType<Prisma.FloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const ListingCountOrderByAggregateInputSchema: z.ZodType<Prisma.ListingCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  propertyType: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  city: z.lazy(() => SortOrderSchema).optional(),
  state: z.lazy(() => SortOrderSchema).optional(),
  zipCode: z.lazy(() => SortOrderSchema).optional(),
  amenities: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  houseRules: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ListingAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ListingMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  propertyType: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  city: z.lazy(() => SortOrderSchema).optional(),
  state: z.lazy(() => SortOrderSchema).optional(),
  zipCode: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  houseRules: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingMinOrderByAggregateInputSchema: z.ZodType<Prisma.ListingMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  propertyType: z.lazy(() => SortOrderSchema).optional(),
  address: z.lazy(() => SortOrderSchema).optional(),
  city: z.lazy(() => SortOrderSchema).optional(),
  state: z.lazy(() => SortOrderSchema).optional(),
  zipCode: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional(),
  houseRules: z.lazy(() => SortOrderSchema).optional(),
  published: z.lazy(() => SortOrderSchema).optional(),
  ownerId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ListingSumOrderByAggregateInputSchema: z.ZodType<Prisma.ListingSumOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  pricePerNight: z.lazy(() => SortOrderSchema).optional(),
  minimumStay: z.lazy(() => SortOrderSchema).optional(),
  maximumGuests: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FloatWithAggregatesFilterSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutRolesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutRolesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRolesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRolesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRolesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const EnumRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRoleFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RoleSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutRolesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutRolesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRolesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRolesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutRolesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutRolesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutRolesInputSchema),z.lazy(() => UserUpdateWithoutRolesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRolesInputSchema) ]).optional(),
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const UserCreateNestedOneWithoutPermissionsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPermissionsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPermissionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPermissionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const EnumPermissionFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPermissionFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => PermissionSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutPermissionsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutPermissionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPermissionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPermissionsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPermissionsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPermissionsInputSchema),z.lazy(() => UserUpdateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPermissionsInputSchema) ]).optional(),
}).strict();

export const EmailAddressCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressCreateWithoutUserInputSchema).array(),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema),z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmailAddressCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExternalAccountCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateWithoutUserInputSchema).array(),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExternalAccountCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ListingCreateNestedManyWithoutOwnerInputSchema: z.ZodType<Prisma.ListingCreateNestedManyWithoutOwnerInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingCreateWithoutOwnerInputSchema).array(),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingCreateManyOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserRoleCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserRoleCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleCreateWithoutUserInputSchema).array(),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRoleCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserPermissionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionCreateWithoutUserInputSchema).array(),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserPermissionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressCreateWithoutUserInputSchema).array(),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema),z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmailAddressCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateWithoutUserInputSchema).array(),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExternalAccountCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ListingUncheckedCreateNestedManyWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUncheckedCreateNestedManyWithoutOwnerInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingCreateWithoutOwnerInputSchema).array(),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingCreateManyOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserRoleUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleCreateWithoutUserInputSchema).array(),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRoleCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionCreateWithoutUserInputSchema).array(),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserPermissionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const EmailAddressUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.EmailAddressUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressCreateWithoutUserInputSchema).array(),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema),z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EmailAddressUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EmailAddressUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmailAddressCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EmailAddressUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EmailAddressUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EmailAddressUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => EmailAddressUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EmailAddressScalarWhereInputSchema),z.lazy(() => EmailAddressScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExternalAccountUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ExternalAccountUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateWithoutUserInputSchema).array(),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExternalAccountUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ExternalAccountUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExternalAccountCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExternalAccountUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ExternalAccountUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExternalAccountUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ExternalAccountUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExternalAccountScalarWhereInputSchema),z.lazy(() => ExternalAccountScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ListingUpdateManyWithoutOwnerNestedInputSchema: z.ZodType<Prisma.ListingUpdateManyWithoutOwnerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingCreateWithoutOwnerInputSchema).array(),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ListingUpsertWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ListingUpsertWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingCreateManyOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ListingUpdateWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ListingUpdateWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ListingUpdateManyWithWhereWithoutOwnerInputSchema),z.lazy(() => ListingUpdateManyWithWhereWithoutOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ListingScalarWhereInputSchema),z.lazy(() => ListingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserRoleUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserRoleUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleCreateWithoutUserInputSchema).array(),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserRoleUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRoleUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRoleCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserRoleUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRoleUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserRoleUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserRoleUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserRoleScalarWhereInputSchema),z.lazy(() => UserRoleScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserPermissionUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserPermissionUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionCreateWithoutUserInputSchema).array(),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserPermissionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserPermissionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserPermissionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserPermissionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserPermissionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserPermissionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserPermissionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserPermissionScalarWhereInputSchema),z.lazy(() => UserPermissionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.EmailAddressUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressCreateWithoutUserInputSchema).array(),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema),z.lazy(() => EmailAddressCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => EmailAddressUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EmailAddressUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => EmailAddressCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => EmailAddressWhereUniqueInputSchema),z.lazy(() => EmailAddressWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => EmailAddressUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => EmailAddressUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => EmailAddressUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => EmailAddressUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => EmailAddressScalarWhereInputSchema),z.lazy(() => EmailAddressScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateWithoutUserInputSchema).array(),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema),z.lazy(() => ExternalAccountCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ExternalAccountUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ExternalAccountUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ExternalAccountCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ExternalAccountWhereUniqueInputSchema),z.lazy(() => ExternalAccountWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ExternalAccountUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ExternalAccountUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ExternalAccountUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ExternalAccountUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ExternalAccountScalarWhereInputSchema),z.lazy(() => ExternalAccountScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateManyWithoutOwnerNestedInput> = z.object({
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingCreateWithoutOwnerInputSchema).array(),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema),z.lazy(() => ListingCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ListingUpsertWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ListingUpsertWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ListingCreateManyOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ListingWhereUniqueInputSchema),z.lazy(() => ListingWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ListingUpdateWithWhereUniqueWithoutOwnerInputSchema),z.lazy(() => ListingUpdateWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ListingUpdateManyWithWhereWithoutOwnerInputSchema),z.lazy(() => ListingUpdateManyWithWhereWithoutOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ListingScalarWhereInputSchema),z.lazy(() => ListingScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleCreateWithoutUserInputSchema).array(),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserRoleCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserRoleUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRoleUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserRoleCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserRoleWhereUniqueInputSchema),z.lazy(() => UserRoleWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserRoleUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserRoleUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserRoleUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserRoleUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserRoleScalarWhereInputSchema),z.lazy(() => UserRoleScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserPermissionUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionCreateWithoutUserInputSchema).array(),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserPermissionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserPermissionUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserPermissionUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserPermissionCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserPermissionWhereUniqueInputSchema),z.lazy(() => UserPermissionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserPermissionUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserPermissionUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserPermissionUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserPermissionUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserPermissionScalarWhereInputSchema),z.lazy(() => UserPermissionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutEmailAddressesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEmailAddressesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEmailAddressesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const UserUpdateOneRequiredWithoutEmailAddressesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutEmailAddressesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEmailAddressesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutEmailAddressesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutEmailAddressesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutEmailAddressesInputSchema),z.lazy(() => UserUpdateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEmailAddressesInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutExternalAccountsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutExternalAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutExternalAccountsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutExternalAccountsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutExternalAccountsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutExternalAccountsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutExternalAccountsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutExternalAccountsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutExternalAccountsInputSchema),z.lazy(() => UserUpdateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutExternalAccountsInputSchema) ]).optional(),
}).strict();

export const ListingCreateamenitiesInputSchema: z.ZodType<Prisma.ListingCreateamenitiesInput> = z.object({
  set: z.string().array()
}).strict();

export const UserCreateNestedOneWithoutListingsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutListingsInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutListingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutListingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutListingsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const ListingUpdateamenitiesInputSchema: z.ZodType<Prisma.ListingUpdateamenitiesInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const FloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const UserUpdateOneRequiredWithoutListingsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutListingsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutListingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutListingsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutListingsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutListingsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutListingsInputSchema),z.lazy(() => UserUpdateWithoutListingsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutListingsInputSchema) ]).optional(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedEnumRoleFilterSchema: z.ZodType<Prisma.NestedEnumRoleFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleFilterSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedEnumRoleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RoleSchema).optional(),
  in: z.lazy(() => RoleSchema).array().optional(),
  notIn: z.lazy(() => RoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RoleSchema),z.lazy(() => NestedEnumRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRoleFilterSchema).optional()
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedEnumPermissionFilterSchema: z.ZodType<Prisma.NestedEnumPermissionFilter> = z.object({
  equals: z.lazy(() => PermissionSchema).optional(),
  in: z.lazy(() => PermissionSchema).array().optional(),
  notIn: z.lazy(() => PermissionSchema).array().optional(),
  not: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => NestedEnumPermissionFilterSchema) ]).optional(),
}).strict();

export const NestedEnumPermissionWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumPermissionWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PermissionSchema).optional(),
  in: z.lazy(() => PermissionSchema).array().optional(),
  notIn: z.lazy(() => PermissionSchema).array().optional(),
  not: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => NestedEnumPermissionWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPermissionFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPermissionFilterSchema).optional()
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedFloatWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional()
}).strict();

export const UserCreateWithoutRolesInputSchema: z.ZodType<Prisma.UserCreateWithoutRolesInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutRolesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutRolesInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutRolesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutRolesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutRolesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRolesInputSchema) ]),
}).strict();

export const UserUpsertWithoutRolesInputSchema: z.ZodType<Prisma.UserUpsertWithoutRolesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutRolesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRolesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutRolesInputSchema),z.lazy(() => UserUncheckedCreateWithoutRolesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutRolesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutRolesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutRolesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutRolesInputSchema) ]),
}).strict();

export const UserUpdateWithoutRolesInputSchema: z.ZodType<Prisma.UserUpdateWithoutRolesInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutRolesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutRolesInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutPermissionsInputSchema: z.ZodType<Prisma.UserCreateWithoutPermissionsInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutPermissionsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutPermissionsInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutPermissionsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPermissionsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPermissionsInputSchema) ]),
}).strict();

export const UserUpsertWithoutPermissionsInputSchema: z.ZodType<Prisma.UserUpsertWithoutPermissionsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPermissionsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedCreateWithoutPermissionsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutPermissionsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPermissionsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPermissionsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutPermissionsInputSchema) ]),
}).strict();

export const UserUpdateWithoutPermissionsInputSchema: z.ZodType<Prisma.UserUpdateWithoutPermissionsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutPermissionsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutPermissionsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const EmailAddressCreateWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressCreateWithoutUserInput> = z.object({
  id: z.string(),
  emailAddress: z.string(),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable()
}).strict();

export const EmailAddressUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUncheckedCreateWithoutUserInput> = z.object({
  id: z.string(),
  emailAddress: z.string(),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable()
}).strict();

export const EmailAddressCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => EmailAddressWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const EmailAddressCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.EmailAddressCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => EmailAddressCreateManyUserInputSchema),z.lazy(() => EmailAddressCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ExternalAccountCreateWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountCreateWithoutUserInput> = z.object({
  id: z.string(),
  provider: z.string(),
  externalId: z.string()
}).strict();

export const ExternalAccountUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedCreateWithoutUserInput> = z.object({
  id: z.string(),
  provider: z.string(),
  externalId: z.string()
}).strict();

export const ExternalAccountCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ExternalAccountWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const ExternalAccountCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ExternalAccountCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ExternalAccountCreateManyUserInputSchema),z.lazy(() => ExternalAccountCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ListingCreateWithoutOwnerInputSchema: z.ZodType<Prisma.ListingCreateWithoutOwnerInput> = z.object({
  title: z.string(),
  description: z.string(),
  propertyType: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number(),
  minimumStay: z.number().int().optional(),
  maximumGuests: z.number().int().optional(),
  houseRules: z.string(),
  published: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ListingUncheckedCreateWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUncheckedCreateWithoutOwnerInput> = z.object({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string(),
  propertyType: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number(),
  minimumStay: z.number().int().optional(),
  maximumGuests: z.number().int().optional(),
  houseRules: z.string(),
  published: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const ListingCreateOrConnectWithoutOwnerInputSchema: z.ZodType<Prisma.ListingCreateOrConnectWithoutOwnerInput> = z.object({
  where: z.lazy(() => ListingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema) ]),
}).strict();

export const ListingCreateManyOwnerInputEnvelopeSchema: z.ZodType<Prisma.ListingCreateManyOwnerInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ListingCreateManyOwnerInputSchema),z.lazy(() => ListingCreateManyOwnerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserRoleCreateWithoutUserInputSchema: z.ZodType<Prisma.UserRoleCreateWithoutUserInput> = z.object({
  role: z.lazy(() => RoleSchema)
}).strict();

export const UserRoleUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUncheckedCreateWithoutUserInput> = z.object({
  id: z.number().int().optional(),
  role: z.lazy(() => RoleSchema)
}).strict();

export const UserRoleCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserRoleCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserRoleWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserRoleCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserRoleCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserRoleCreateManyUserInputSchema),z.lazy(() => UserRoleCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserPermissionCreateWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionCreateWithoutUserInput> = z.object({
  permission: z.lazy(() => PermissionSchema)
}).strict();

export const UserPermissionUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUncheckedCreateWithoutUserInput> = z.object({
  id: z.number().int().optional(),
  permission: z.lazy(() => PermissionSchema)
}).strict();

export const UserPermissionCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserPermissionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserPermissionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserPermissionCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserPermissionCreateManyUserInputSchema),z.lazy(() => UserPermissionCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const EmailAddressUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => EmailAddressWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EmailAddressUpdateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => EmailAddressCreateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const EmailAddressUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => EmailAddressWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => EmailAddressUpdateWithoutUserInputSchema),z.lazy(() => EmailAddressUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const EmailAddressUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => EmailAddressScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EmailAddressUpdateManyMutationInputSchema),z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const EmailAddressScalarWhereInputSchema: z.ZodType<Prisma.EmailAddressScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EmailAddressScalarWhereInputSchema),z.lazy(() => EmailAddressScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EmailAddressScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EmailAddressScalarWhereInputSchema),z.lazy(() => EmailAddressScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  emailAddress: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isPrimary: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  verification: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const ExternalAccountUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ExternalAccountWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ExternalAccountUpdateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => ExternalAccountCreateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const ExternalAccountUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ExternalAccountWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ExternalAccountUpdateWithoutUserInputSchema),z.lazy(() => ExternalAccountUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const ExternalAccountUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ExternalAccountScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ExternalAccountUpdateManyMutationInputSchema),z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const ExternalAccountScalarWhereInputSchema: z.ZodType<Prisma.ExternalAccountScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ExternalAccountScalarWhereInputSchema),z.lazy(() => ExternalAccountScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ExternalAccountScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ExternalAccountScalarWhereInputSchema),z.lazy(() => ExternalAccountScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  provider: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  externalId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const ListingUpsertWithWhereUniqueWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUpsertWithWhereUniqueWithoutOwnerInput> = z.object({
  where: z.lazy(() => ListingWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ListingUpdateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutOwnerInputSchema) ]),
  create: z.union([ z.lazy(() => ListingCreateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedCreateWithoutOwnerInputSchema) ]),
}).strict();

export const ListingUpdateWithWhereUniqueWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUpdateWithWhereUniqueWithoutOwnerInput> = z.object({
  where: z.lazy(() => ListingWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ListingUpdateWithoutOwnerInputSchema),z.lazy(() => ListingUncheckedUpdateWithoutOwnerInputSchema) ]),
}).strict();

export const ListingUpdateManyWithWhereWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUpdateManyWithWhereWithoutOwnerInput> = z.object({
  where: z.lazy(() => ListingScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ListingUpdateManyMutationInputSchema),z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerInputSchema) ]),
}).strict();

export const ListingScalarWhereInputSchema: z.ZodType<Prisma.ListingScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ListingScalarWhereInputSchema),z.lazy(() => ListingScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ListingScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ListingScalarWhereInputSchema),z.lazy(() => ListingScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  propertyType: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  address: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  city: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  state: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  zipCode: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  amenities: z.lazy(() => StringNullableListFilterSchema).optional(),
  pricePerNight: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  minimumStay: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  maximumGuests: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  houseRules: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  published: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  ownerId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserRoleUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserRoleWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserRoleUpdateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserRoleUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserRoleWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserRoleUpdateWithoutUserInputSchema),z.lazy(() => UserRoleUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserRoleUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserRoleScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserRoleUpdateManyMutationInputSchema),z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserRoleScalarWhereInputSchema: z.ZodType<Prisma.UserRoleScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserRoleScalarWhereInputSchema),z.lazy(() => UserRoleScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleScalarWhereInputSchema),z.lazy(() => UserRoleScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  role: z.union([ z.lazy(() => EnumRoleFilterSchema),z.lazy(() => RoleSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UserPermissionUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserPermissionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserPermissionUpdateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserPermissionCreateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserPermissionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserPermissionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserPermissionUpdateWithoutUserInputSchema),z.lazy(() => UserPermissionUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserPermissionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserPermissionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserPermissionUpdateManyMutationInputSchema),z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserPermissionScalarWhereInputSchema: z.ZodType<Prisma.UserPermissionScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserPermissionScalarWhereInputSchema),z.lazy(() => UserPermissionScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserPermissionScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserPermissionScalarWhereInputSchema),z.lazy(() => UserPermissionScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  permission: z.union([ z.lazy(() => EnumPermissionFilterSchema),z.lazy(() => PermissionSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const UserCreateWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserCreateWithoutEmailAddressesInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutEmailAddressesInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutEmailAddressesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEmailAddressesInputSchema) ]),
}).strict();

export const UserUpsertWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserUpsertWithoutEmailAddressesInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEmailAddressesInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedCreateWithoutEmailAddressesInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutEmailAddressesInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutEmailAddressesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutEmailAddressesInputSchema) ]),
}).strict();

export const UserUpdateWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserUpdateWithoutEmailAddressesInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutEmailAddressesInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutEmailAddressesInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserCreateWithoutExternalAccountsInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutExternalAccountsInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutExternalAccountsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutExternalAccountsInputSchema) ]),
}).strict();

export const UserUpsertWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserUpsertWithoutExternalAccountsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutExternalAccountsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedCreateWithoutExternalAccountsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutExternalAccountsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutExternalAccountsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutExternalAccountsInputSchema) ]),
}).strict();

export const UserUpdateWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserUpdateWithoutExternalAccountsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutExternalAccountsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutExternalAccountsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  listings: z.lazy(() => ListingUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateWithoutListingsInputSchema: z.ZodType<Prisma.UserCreateWithoutListingsInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  emailAddresses: z.lazy(() => EmailAddressCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountCreateNestedManyWithoutUserInputSchema).optional(),
  roles: z.lazy(() => UserRoleCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutListingsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutListingsInput> = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedCreateNestedManyWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutListingsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutListingsInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutListingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutListingsInputSchema) ]),
}).strict();

export const UserUpsertWithoutListingsInputSchema: z.ZodType<Prisma.UserUpsertWithoutListingsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutListingsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutListingsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutListingsInputSchema),z.lazy(() => UserUncheckedCreateWithoutListingsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutListingsInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutListingsInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutListingsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutListingsInputSchema) ]),
}).strict();

export const UserUpdateWithoutListingsInputSchema: z.ZodType<Prisma.UserUpdateWithoutListingsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUpdateManyWithoutUserNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutListingsInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutListingsInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lastName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  imageUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddresses: z.lazy(() => EmailAddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  externalAccounts: z.lazy(() => ExternalAccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  roles: z.lazy(() => UserRoleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  permissions: z.lazy(() => UserPermissionUncheckedUpdateManyWithoutUserNestedInputSchema).optional()
}).strict();

export const EmailAddressCreateManyUserInputSchema: z.ZodType<Prisma.EmailAddressCreateManyUserInput> = z.object({
  id: z.string(),
  emailAddress: z.string(),
  isPrimary: z.boolean().optional(),
  verification: z.string().optional().nullable()
}).strict();

export const ExternalAccountCreateManyUserInputSchema: z.ZodType<Prisma.ExternalAccountCreateManyUserInput> = z.object({
  id: z.string(),
  provider: z.string(),
  externalId: z.string()
}).strict();

export const ListingCreateManyOwnerInputSchema: z.ZodType<Prisma.ListingCreateManyOwnerInput> = z.object({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string(),
  propertyType: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  amenities: z.union([ z.lazy(() => ListingCreateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.number(),
  minimumStay: z.number().int().optional(),
  maximumGuests: z.number().int().optional(),
  houseRules: z.string(),
  published: z.boolean().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserRoleCreateManyUserInputSchema: z.ZodType<Prisma.UserRoleCreateManyUserInput> = z.object({
  id: z.number().int().optional(),
  role: z.lazy(() => RoleSchema)
}).strict();

export const UserPermissionCreateManyUserInputSchema: z.ZodType<Prisma.UserPermissionCreateManyUserInput> = z.object({
  id: z.number().int().optional(),
  permission: z.lazy(() => PermissionSchema)
}).strict();

export const EmailAddressUpdateWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const EmailAddressUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const EmailAddressUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.EmailAddressUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailAddress: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isPrimary: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  verification: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ExternalAccountUpdateWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ExternalAccountUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.ExternalAccountUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  provider: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  externalId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingUpdateWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUpdateWithoutOwnerInput> = z.object({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  city: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  zipCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingUncheckedUpdateWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateWithoutOwnerInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  city: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  zipCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ListingUncheckedUpdateManyWithoutOwnerInputSchema: z.ZodType<Prisma.ListingUncheckedUpdateManyWithoutOwnerInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  propertyType: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  address: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  city: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  state: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  zipCode: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  amenities: z.union([ z.lazy(() => ListingUpdateamenitiesInputSchema),z.string().array() ]).optional(),
  pricePerNight: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  minimumStay: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  maximumGuests: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  houseRules: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  published: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUpdateWithoutUserInput> = z.object({
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RoleSchema),z.lazy(() => EnumRoleFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUpdateWithoutUserInput> = z.object({
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserPermissionUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserPermissionUncheckedUpdateManyWithoutUserInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  permission: z.union([ z.lazy(() => PermissionSchema),z.lazy(() => EnumPermissionFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserRoleFindFirstArgsSchema: z.ZodType<Prisma.UserRoleFindFirstArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereInputSchema.optional(),
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(),UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRoleScalarFieldEnumSchema,UserRoleScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserRoleFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserRoleFindFirstOrThrowArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereInputSchema.optional(),
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(),UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRoleScalarFieldEnumSchema,UserRoleScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserRoleFindManyArgsSchema: z.ZodType<Prisma.UserRoleFindManyArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereInputSchema.optional(),
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(),UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRoleScalarFieldEnumSchema,UserRoleScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserRoleAggregateArgsSchema: z.ZodType<Prisma.UserRoleAggregateArgs> = z.object({
  where: UserRoleWhereInputSchema.optional(),
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(),UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserRoleGroupByArgsSchema: z.ZodType<Prisma.UserRoleGroupByArgs> = z.object({
  where: UserRoleWhereInputSchema.optional(),
  orderBy: z.union([ UserRoleOrderByWithAggregationInputSchema.array(),UserRoleOrderByWithAggregationInputSchema ]).optional(),
  by: UserRoleScalarFieldEnumSchema.array(),
  having: UserRoleScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserRoleFindUniqueArgsSchema: z.ZodType<Prisma.UserRoleFindUniqueArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema,
}).strict() ;

export const UserRoleFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserRoleFindUniqueOrThrowArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema,
}).strict() ;

export const UserPermissionFindFirstArgsSchema: z.ZodType<Prisma.UserPermissionFindFirstArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereInputSchema.optional(),
  orderBy: z.union([ UserPermissionOrderByWithRelationInputSchema.array(),UserPermissionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserPermissionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserPermissionScalarFieldEnumSchema,UserPermissionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserPermissionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserPermissionFindFirstOrThrowArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereInputSchema.optional(),
  orderBy: z.union([ UserPermissionOrderByWithRelationInputSchema.array(),UserPermissionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserPermissionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserPermissionScalarFieldEnumSchema,UserPermissionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserPermissionFindManyArgsSchema: z.ZodType<Prisma.UserPermissionFindManyArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereInputSchema.optional(),
  orderBy: z.union([ UserPermissionOrderByWithRelationInputSchema.array(),UserPermissionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserPermissionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserPermissionScalarFieldEnumSchema,UserPermissionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserPermissionAggregateArgsSchema: z.ZodType<Prisma.UserPermissionAggregateArgs> = z.object({
  where: UserPermissionWhereInputSchema.optional(),
  orderBy: z.union([ UserPermissionOrderByWithRelationInputSchema.array(),UserPermissionOrderByWithRelationInputSchema ]).optional(),
  cursor: UserPermissionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserPermissionGroupByArgsSchema: z.ZodType<Prisma.UserPermissionGroupByArgs> = z.object({
  where: UserPermissionWhereInputSchema.optional(),
  orderBy: z.union([ UserPermissionOrderByWithAggregationInputSchema.array(),UserPermissionOrderByWithAggregationInputSchema ]).optional(),
  by: UserPermissionScalarFieldEnumSchema.array(),
  having: UserPermissionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserPermissionFindUniqueArgsSchema: z.ZodType<Prisma.UserPermissionFindUniqueArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereUniqueInputSchema,
}).strict() ;

export const UserPermissionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserPermissionFindUniqueOrThrowArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereUniqueInputSchema,
}).strict() ;

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const EmailAddressFindFirstArgsSchema: z.ZodType<Prisma.EmailAddressFindFirstArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereInputSchema.optional(),
  orderBy: z.union([ EmailAddressOrderByWithRelationInputSchema.array(),EmailAddressOrderByWithRelationInputSchema ]).optional(),
  cursor: EmailAddressWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmailAddressScalarFieldEnumSchema,EmailAddressScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EmailAddressFindFirstOrThrowArgsSchema: z.ZodType<Prisma.EmailAddressFindFirstOrThrowArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereInputSchema.optional(),
  orderBy: z.union([ EmailAddressOrderByWithRelationInputSchema.array(),EmailAddressOrderByWithRelationInputSchema ]).optional(),
  cursor: EmailAddressWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmailAddressScalarFieldEnumSchema,EmailAddressScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EmailAddressFindManyArgsSchema: z.ZodType<Prisma.EmailAddressFindManyArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereInputSchema.optional(),
  orderBy: z.union([ EmailAddressOrderByWithRelationInputSchema.array(),EmailAddressOrderByWithRelationInputSchema ]).optional(),
  cursor: EmailAddressWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EmailAddressScalarFieldEnumSchema,EmailAddressScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const EmailAddressAggregateArgsSchema: z.ZodType<Prisma.EmailAddressAggregateArgs> = z.object({
  where: EmailAddressWhereInputSchema.optional(),
  orderBy: z.union([ EmailAddressOrderByWithRelationInputSchema.array(),EmailAddressOrderByWithRelationInputSchema ]).optional(),
  cursor: EmailAddressWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EmailAddressGroupByArgsSchema: z.ZodType<Prisma.EmailAddressGroupByArgs> = z.object({
  where: EmailAddressWhereInputSchema.optional(),
  orderBy: z.union([ EmailAddressOrderByWithAggregationInputSchema.array(),EmailAddressOrderByWithAggregationInputSchema ]).optional(),
  by: EmailAddressScalarFieldEnumSchema.array(),
  having: EmailAddressScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const EmailAddressFindUniqueArgsSchema: z.ZodType<Prisma.EmailAddressFindUniqueArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereUniqueInputSchema,
}).strict() ;

export const EmailAddressFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.EmailAddressFindUniqueOrThrowArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereUniqueInputSchema,
}).strict() ;

export const ExternalAccountFindFirstArgsSchema: z.ZodType<Prisma.ExternalAccountFindFirstArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereInputSchema.optional(),
  orderBy: z.union([ ExternalAccountOrderByWithRelationInputSchema.array(),ExternalAccountOrderByWithRelationInputSchema ]).optional(),
  cursor: ExternalAccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExternalAccountScalarFieldEnumSchema,ExternalAccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExternalAccountFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ExternalAccountFindFirstOrThrowArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereInputSchema.optional(),
  orderBy: z.union([ ExternalAccountOrderByWithRelationInputSchema.array(),ExternalAccountOrderByWithRelationInputSchema ]).optional(),
  cursor: ExternalAccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExternalAccountScalarFieldEnumSchema,ExternalAccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExternalAccountFindManyArgsSchema: z.ZodType<Prisma.ExternalAccountFindManyArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereInputSchema.optional(),
  orderBy: z.union([ ExternalAccountOrderByWithRelationInputSchema.array(),ExternalAccountOrderByWithRelationInputSchema ]).optional(),
  cursor: ExternalAccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ExternalAccountScalarFieldEnumSchema,ExternalAccountScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ExternalAccountAggregateArgsSchema: z.ZodType<Prisma.ExternalAccountAggregateArgs> = z.object({
  where: ExternalAccountWhereInputSchema.optional(),
  orderBy: z.union([ ExternalAccountOrderByWithRelationInputSchema.array(),ExternalAccountOrderByWithRelationInputSchema ]).optional(),
  cursor: ExternalAccountWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ExternalAccountGroupByArgsSchema: z.ZodType<Prisma.ExternalAccountGroupByArgs> = z.object({
  where: ExternalAccountWhereInputSchema.optional(),
  orderBy: z.union([ ExternalAccountOrderByWithAggregationInputSchema.array(),ExternalAccountOrderByWithAggregationInputSchema ]).optional(),
  by: ExternalAccountScalarFieldEnumSchema.array(),
  having: ExternalAccountScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ExternalAccountFindUniqueArgsSchema: z.ZodType<Prisma.ExternalAccountFindUniqueArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereUniqueInputSchema,
}).strict() ;

export const ExternalAccountFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ExternalAccountFindUniqueOrThrowArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereUniqueInputSchema,
}).strict() ;

export const ListingFindFirstArgsSchema: z.ZodType<Prisma.ListingFindFirstArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereInputSchema.optional(),
  orderBy: z.union([ ListingOrderByWithRelationInputSchema.array(),ListingOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ListingScalarFieldEnumSchema,ListingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ListingFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ListingFindFirstOrThrowArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereInputSchema.optional(),
  orderBy: z.union([ ListingOrderByWithRelationInputSchema.array(),ListingOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ListingScalarFieldEnumSchema,ListingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ListingFindManyArgsSchema: z.ZodType<Prisma.ListingFindManyArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereInputSchema.optional(),
  orderBy: z.union([ ListingOrderByWithRelationInputSchema.array(),ListingOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ListingScalarFieldEnumSchema,ListingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ListingAggregateArgsSchema: z.ZodType<Prisma.ListingAggregateArgs> = z.object({
  where: ListingWhereInputSchema.optional(),
  orderBy: z.union([ ListingOrderByWithRelationInputSchema.array(),ListingOrderByWithRelationInputSchema ]).optional(),
  cursor: ListingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ListingGroupByArgsSchema: z.ZodType<Prisma.ListingGroupByArgs> = z.object({
  where: ListingWhereInputSchema.optional(),
  orderBy: z.union([ ListingOrderByWithAggregationInputSchema.array(),ListingOrderByWithAggregationInputSchema ]).optional(),
  by: ListingScalarFieldEnumSchema.array(),
  having: ListingScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ListingFindUniqueArgsSchema: z.ZodType<Prisma.ListingFindUniqueArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereUniqueInputSchema,
}).strict() ;

export const ListingFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ListingFindUniqueOrThrowArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereUniqueInputSchema,
}).strict() ;

export const UserRoleCreateArgsSchema: z.ZodType<Prisma.UserRoleCreateArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  data: z.union([ UserRoleCreateInputSchema,UserRoleUncheckedCreateInputSchema ]),
}).strict() ;

export const UserRoleUpsertArgsSchema: z.ZodType<Prisma.UserRoleUpsertArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema,
  create: z.union([ UserRoleCreateInputSchema,UserRoleUncheckedCreateInputSchema ]),
  update: z.union([ UserRoleUpdateInputSchema,UserRoleUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserRoleCreateManyArgsSchema: z.ZodType<Prisma.UserRoleCreateManyArgs> = z.object({
  data: z.union([ UserRoleCreateManyInputSchema,UserRoleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserRoleCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserRoleCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserRoleCreateManyInputSchema,UserRoleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserRoleDeleteArgsSchema: z.ZodType<Prisma.UserRoleDeleteArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema,
}).strict() ;

export const UserRoleUpdateArgsSchema: z.ZodType<Prisma.UserRoleUpdateArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  data: z.union([ UserRoleUpdateInputSchema,UserRoleUncheckedUpdateInputSchema ]),
  where: UserRoleWhereUniqueInputSchema,
}).strict() ;

export const UserRoleUpdateManyArgsSchema: z.ZodType<Prisma.UserRoleUpdateManyArgs> = z.object({
  data: z.union([ UserRoleUpdateManyMutationInputSchema,UserRoleUncheckedUpdateManyInputSchema ]),
  where: UserRoleWhereInputSchema.optional(),
}).strict() ;

export const UserRoleDeleteManyArgsSchema: z.ZodType<Prisma.UserRoleDeleteManyArgs> = z.object({
  where: UserRoleWhereInputSchema.optional(),
}).strict() ;

export const UserPermissionCreateArgsSchema: z.ZodType<Prisma.UserPermissionCreateArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  data: z.union([ UserPermissionCreateInputSchema,UserPermissionUncheckedCreateInputSchema ]),
}).strict() ;

export const UserPermissionUpsertArgsSchema: z.ZodType<Prisma.UserPermissionUpsertArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereUniqueInputSchema,
  create: z.union([ UserPermissionCreateInputSchema,UserPermissionUncheckedCreateInputSchema ]),
  update: z.union([ UserPermissionUpdateInputSchema,UserPermissionUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserPermissionCreateManyArgsSchema: z.ZodType<Prisma.UserPermissionCreateManyArgs> = z.object({
  data: z.union([ UserPermissionCreateManyInputSchema,UserPermissionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserPermissionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserPermissionCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserPermissionCreateManyInputSchema,UserPermissionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserPermissionDeleteArgsSchema: z.ZodType<Prisma.UserPermissionDeleteArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  where: UserPermissionWhereUniqueInputSchema,
}).strict() ;

export const UserPermissionUpdateArgsSchema: z.ZodType<Prisma.UserPermissionUpdateArgs> = z.object({
  select: UserPermissionSelectSchema.optional(),
  include: UserPermissionIncludeSchema.optional(),
  data: z.union([ UserPermissionUpdateInputSchema,UserPermissionUncheckedUpdateInputSchema ]),
  where: UserPermissionWhereUniqueInputSchema,
}).strict() ;

export const UserPermissionUpdateManyArgsSchema: z.ZodType<Prisma.UserPermissionUpdateManyArgs> = z.object({
  data: z.union([ UserPermissionUpdateManyMutationInputSchema,UserPermissionUncheckedUpdateManyInputSchema ]),
  where: UserPermissionWhereInputSchema.optional(),
}).strict() ;

export const UserPermissionDeleteManyArgsSchema: z.ZodType<Prisma.UserPermissionDeleteManyArgs> = z.object({
  where: UserPermissionWhereInputSchema.optional(),
}).strict() ;

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
}).strict() ;

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const EmailAddressCreateArgsSchema: z.ZodType<Prisma.EmailAddressCreateArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  data: z.union([ EmailAddressCreateInputSchema,EmailAddressUncheckedCreateInputSchema ]),
}).strict() ;

export const EmailAddressUpsertArgsSchema: z.ZodType<Prisma.EmailAddressUpsertArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereUniqueInputSchema,
  create: z.union([ EmailAddressCreateInputSchema,EmailAddressUncheckedCreateInputSchema ]),
  update: z.union([ EmailAddressUpdateInputSchema,EmailAddressUncheckedUpdateInputSchema ]),
}).strict() ;

export const EmailAddressCreateManyArgsSchema: z.ZodType<Prisma.EmailAddressCreateManyArgs> = z.object({
  data: z.union([ EmailAddressCreateManyInputSchema,EmailAddressCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EmailAddressCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EmailAddressCreateManyAndReturnArgs> = z.object({
  data: z.union([ EmailAddressCreateManyInputSchema,EmailAddressCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const EmailAddressDeleteArgsSchema: z.ZodType<Prisma.EmailAddressDeleteArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  where: EmailAddressWhereUniqueInputSchema,
}).strict() ;

export const EmailAddressUpdateArgsSchema: z.ZodType<Prisma.EmailAddressUpdateArgs> = z.object({
  select: EmailAddressSelectSchema.optional(),
  include: EmailAddressIncludeSchema.optional(),
  data: z.union([ EmailAddressUpdateInputSchema,EmailAddressUncheckedUpdateInputSchema ]),
  where: EmailAddressWhereUniqueInputSchema,
}).strict() ;

export const EmailAddressUpdateManyArgsSchema: z.ZodType<Prisma.EmailAddressUpdateManyArgs> = z.object({
  data: z.union([ EmailAddressUpdateManyMutationInputSchema,EmailAddressUncheckedUpdateManyInputSchema ]),
  where: EmailAddressWhereInputSchema.optional(),
}).strict() ;

export const EmailAddressDeleteManyArgsSchema: z.ZodType<Prisma.EmailAddressDeleteManyArgs> = z.object({
  where: EmailAddressWhereInputSchema.optional(),
}).strict() ;

export const ExternalAccountCreateArgsSchema: z.ZodType<Prisma.ExternalAccountCreateArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  data: z.union([ ExternalAccountCreateInputSchema,ExternalAccountUncheckedCreateInputSchema ]),
}).strict() ;

export const ExternalAccountUpsertArgsSchema: z.ZodType<Prisma.ExternalAccountUpsertArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereUniqueInputSchema,
  create: z.union([ ExternalAccountCreateInputSchema,ExternalAccountUncheckedCreateInputSchema ]),
  update: z.union([ ExternalAccountUpdateInputSchema,ExternalAccountUncheckedUpdateInputSchema ]),
}).strict() ;

export const ExternalAccountCreateManyArgsSchema: z.ZodType<Prisma.ExternalAccountCreateManyArgs> = z.object({
  data: z.union([ ExternalAccountCreateManyInputSchema,ExternalAccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ExternalAccountCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ExternalAccountCreateManyAndReturnArgs> = z.object({
  data: z.union([ ExternalAccountCreateManyInputSchema,ExternalAccountCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ExternalAccountDeleteArgsSchema: z.ZodType<Prisma.ExternalAccountDeleteArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  where: ExternalAccountWhereUniqueInputSchema,
}).strict() ;

export const ExternalAccountUpdateArgsSchema: z.ZodType<Prisma.ExternalAccountUpdateArgs> = z.object({
  select: ExternalAccountSelectSchema.optional(),
  include: ExternalAccountIncludeSchema.optional(),
  data: z.union([ ExternalAccountUpdateInputSchema,ExternalAccountUncheckedUpdateInputSchema ]),
  where: ExternalAccountWhereUniqueInputSchema,
}).strict() ;

export const ExternalAccountUpdateManyArgsSchema: z.ZodType<Prisma.ExternalAccountUpdateManyArgs> = z.object({
  data: z.union([ ExternalAccountUpdateManyMutationInputSchema,ExternalAccountUncheckedUpdateManyInputSchema ]),
  where: ExternalAccountWhereInputSchema.optional(),
}).strict() ;

export const ExternalAccountDeleteManyArgsSchema: z.ZodType<Prisma.ExternalAccountDeleteManyArgs> = z.object({
  where: ExternalAccountWhereInputSchema.optional(),
}).strict() ;

export const ListingCreateArgsSchema: z.ZodType<Prisma.ListingCreateArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  data: z.union([ ListingCreateInputSchema,ListingUncheckedCreateInputSchema ]),
}).strict() ;

export const ListingUpsertArgsSchema: z.ZodType<Prisma.ListingUpsertArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereUniqueInputSchema,
  create: z.union([ ListingCreateInputSchema,ListingUncheckedCreateInputSchema ]),
  update: z.union([ ListingUpdateInputSchema,ListingUncheckedUpdateInputSchema ]),
}).strict() ;

export const ListingCreateManyArgsSchema: z.ZodType<Prisma.ListingCreateManyArgs> = z.object({
  data: z.union([ ListingCreateManyInputSchema,ListingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ListingCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ListingCreateManyAndReturnArgs> = z.object({
  data: z.union([ ListingCreateManyInputSchema,ListingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ListingDeleteArgsSchema: z.ZodType<Prisma.ListingDeleteArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  where: ListingWhereUniqueInputSchema,
}).strict() ;

export const ListingUpdateArgsSchema: z.ZodType<Prisma.ListingUpdateArgs> = z.object({
  select: ListingSelectSchema.optional(),
  include: ListingIncludeSchema.optional(),
  data: z.union([ ListingUpdateInputSchema,ListingUncheckedUpdateInputSchema ]),
  where: ListingWhereUniqueInputSchema,
}).strict() ;

export const ListingUpdateManyArgsSchema: z.ZodType<Prisma.ListingUpdateManyArgs> = z.object({
  data: z.union([ ListingUpdateManyMutationInputSchema,ListingUncheckedUpdateManyInputSchema ]),
  where: ListingWhereInputSchema.optional(),
}).strict() ;

export const ListingDeleteManyArgsSchema: z.ZodType<Prisma.ListingDeleteManyArgs> = z.object({
  where: ListingWhereInputSchema.optional(),
}).strict() ;