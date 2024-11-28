-- TODO: This file should be cleaned so it doesn't have so much of excessive
-- data, just some test samples

/* -------------------------------------------------------------------------- */
/*                             Creates users table                            */
/* -------------------------------------------------------------------------- */
CREATE TABLE [dbo].[Users](
    [id] [uniqueidentifier] NOT NULL,
    [name] [nvarchar](255) NOT NULL,
    PRIMARY KEY CLUSTERED  ([id] ASC) WITH (
            PAD_INDEX = OFF, 
            STATISTICS_NORECOMPUTE = OFF,
             IGNORE_DUP_KEY = OFF,
              ALLOW_ROW_LOCKS = ON, 
              ALLOW_PAGE_LOCKS = ON,
               OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT INTO users (id, name) VALUES
    ('05e7e760-8e4c-4042-a67c-051acc798cf6', 'Judy'),
    ('20744f67-48f4-44ca-9c9d-16c05134478c', 'Stalin'),
    ('2ebcc5e2-86c2-4f0d-a8a1-1a69937b1297', 'Linda'),
    ('06fcbfba-080f-4be3-98c9-408add8882a0', 'David'),
    ('66bf2c72-be4e-4b54-a1e1-42e9db4a6129', 'Grace'),
    ('35ad4c89-f5e6-4e39-bc87-4b3a264b4bca', 'Mao'),
    ('0de094fc-ed26-44d8-9a61-5fa242f298d2', 'Kim'),
    ('e57dc722-0caa-438d-ae01-5fc7c433ebbd', 'Bob'),
    ('bc15c547-c177-4310-ad1b-69fe4d33327c', 'Xi'),
    ('c86fa155-e759-4851-9f95-6a11cc8f7ef7', 'Merkel'),
    ('0ee2b2c0-9219-4f15-9c1b-6eb58ddbb390', 'Biden'),
    ('cc586537-4907-47a3-88aa-74ee9741f5c1', 'Ivan'),
    ('7271e0ea-431b-47c1-93a3-85c4ab477609', 'Trump'),
    ('9d80a2b8-b1b3-4354-ac8e-8a39f69d07ee', 'Charlie'),
    ('07b6c04b-bf4b-42f7-b421-91d3b0a5fc9a', 'Putin'),
    ('e1934eb2-cf22-4ee8-882d-99da56f4b4a9', 'Heidi'),
    ('772e67ee-ca2a-4efc-81c6-9d4d514b9ee4', 'Eve'),
    ('92f578b9-67a7-4f39-b184-a46fe47df84f', 'Karl'),
    ('feab0622-99a0-4b99-bdc1-b9af2a0e7c83', 'Alice'),
    ('1272ea87-edf2-4ea4-87c1-e920ddd878f7', 'Frank'),
    ('fe2cb557-4f61-479a-9e4e-ed5f0076b466', 'Hitler');

ALTER TABLE [dbo].[Users] ADD  DEFAULT (newid()) FOR [id]


/* -------------------------------------------------------------------------- */
/*                           Creates UserAuth table                           */
/* -------------------------------------------------------------------------- */
CREATE TABLE [dbo].[UserAuth](
    [UserId] [uniqueidentifier] NOT NULL,
    [Username] [nvarchar](255) NOT NULL,
        [PasswordHash] [nvarchar](255) NOT NULL,
    PRIMARY KEY CLUSTERED  ([UserId] ASC) WITH (
        PAD_INDEX = OFF, 
        STATISTICS_NORECOMPUTE = OFF, 
        IGNORE_DUP_KEY = OFF, 
        ALLOW_ROW_LOCKS = ON, 
        ALLOW_PAGE_LOCKS = ON, 
        OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY],
UNIQUE NONCLUSTERED 
([Username] ASC) WITH (
    PAD_INDEX = OFF, 
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON,
    OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[UserAuth]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO

INSERT INTO [dbo].[UserAuth] (UserId, Username, PasswordHash) 
VALUES
('c86fa155-e759-4851-9f95-6a11cc8f7ef7', 'merkel@gmail.com', '$2b$12$dR34oM2NZ8ycoK879ksdLeTJrDGHOdM8uSOEtz4saPMTce3g.zPH.'),
('feab0622-99a0-4b99-bdc1-b9af2a0e7c83', 'alice@gmail.com', '$2b$12$kJcdQl6Ajmnc2bunl/P3Fepi1IqYA18wA3FwAUkFKhGDhKc0Xj3J2');

/* -------------------------------------------------------------------------- */
/*                         Creates Conversations table                        */
/* -------------------------------------------------------------------------- */
CREATE TABLE [dbo].[Conversations](
    [id] [uniqueidentifier] NOT NULL,
    [name] [nvarchar](255) NULL,
    [createdAt] [datetime] NULL,
    [creatorId] [uniqueidentifier] NULL,
    PRIMARY KEY CLUSTERED ([id] ASC) WITH (
        PAD_INDEX = OFF,
        STATISTICS_NORECOMPUTE = OFF,
        IGNORE_DUP_KEY = OFF,
        ALLOW_ROW_LOCKS = ON,
        ALLOW_PAGE_LOCKS = ON,
        OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Conversations] ADD  DEFAULT (newid()) FOR [id]
GO

ALTER TABLE [dbo].[Conversations] ADD  DEFAULT (getdate()) FOR [createdAt]
GO

INSERT INTO conversations (id, name, createdAt, creatorId) VALUES
    ('70dcb962-6156-452b-a763-6307c9520944', 'con-four', '2024-11-02 23:17:24.703', 'feab0622-99a0-4b99-bdc1-b9af2a0e7c83'),
    ('287ac216-e24d-41cd-9dad-af2849ab614e', 'Merkel', '2024-11-21 14:43:43.277', 'feab0622-99a0-4b99-bdc1-b9af2a0e7c83'),
    ('24be1b8c-152b-4240-8834-cdabe7061b68', 'con-two', '2024-11-02 23:17:24.703', 'feab0622-99a0-4b99-bdc1-b9af2a0e7c83'),
    ('aa668031-9253-4ee8-a030-d6319aac15d5', 'con-one', '2024-11-02 23:17:24.703', 'feab0622-99a0-4b99-bdc1-b9af2a0e7c83'),
    ('5e528499-8669-4068-8491-e9cd15730e43', 'con-three', '2024-11-02 23:17:24.703', 'feab0622-99a0-4b99-bdc1-b9af2a0e7c83');

/* -------------------------------------------------------------------------- */
/*                      Creates Users_Conversations table                     */
/* -------------------------------------------------------------------------- */
CREATE TABLE [dbo].[Users_Conversations](
    [userId] [uniqueidentifier] NOT NULL,
    [conversationId] [uniqueidentifier] NOT NULL,
    PRIMARY KEY CLUSTERED (
        [userId] ASC,
        [conversationId] ASC
    )   WITH (
        PAD_INDEX = OFF,
        STATISTICS_NORECOMPUTE = OFF,
        IGNORE_DUP_KEY = OFF,
        ALLOW_ROW_LOCKS = ON,
        ALLOW_PAGE_LOCKS = ON,
        OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Users_Conversations]  WITH CHECK ADD FOREIGN KEY([conversationId])
REFERENCES [dbo].[Conversations] ([id])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[Users_Conversations]  WITH CHECK ADD FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO

INSERT INTO Users_Conversations (userId, conversationId) VALUES
    ('05e7e760-8e4c-4042-a67c-051acc798cf6', 'aa668031-9253-4ee8-a030-d6319aac15d5'),
    ('20744f67-48f4-44ca-9c9d-16c05134478c', 'aa668031-9253-4ee8-a030-d6319aac15d5'),
    ('2ebcc5e2-86c2-4f0d-a8a1-1a69937b1297', 'aa668031-9253-4ee8-a030-d6319aac15d5'),
    ('06fcbfba-080f-4be3-98c9-408add8882a0', 'aa668031-9253-4ee8-a030-d6319aac15d5'),
    ('66bf2c72-be4e-4b54-a1e1-42e9db4a6129', 'aa668031-9253-4ee8-a030-d6319aac15d5'),
    ('35ad4c89-f5e6-4e39-bc87-4b3a264b4bca', '24be1b8c-152b-4240-8834-cdabe7061b68'),
    ('0de094fc-ed26-44d8-9a61-5fa242f298d2', '24be1b8c-152b-4240-8834-cdabe7061b68'),
    ('e57dc722-0caa-438d-ae01-5fc7c433ebbd', '24be1b8c-152b-4240-8834-cdabe7061b68'),
    ('bc15c547-c177-4310-ad1b-69fe4d33327c', '24be1b8c-152b-4240-8834-cdabe7061b68'),
    ('c86fa155-e759-4851-9f95-6a11cc8f7ef7', '70dcb962-6156-452b-a763-6307c9520944'),
    ('c86fa155-e759-4851-9f95-6a11cc8f7ef7', '287ac216-e24d-41cd-9dad-af2849ab614e'),
    ('c86fa155-e759-4851-9f95-6a11cc8f7ef7', '24be1b8c-152b-4240-8834-cdabe7061b68'),
    ('c86fa155-e759-4851-9f95-6a11cc8f7ef7', 'aa668031-9253-4ee8-a030-d6319aac15d5'),
    ('c86fa155-e759-4851-9f95-6a11cc8f7ef7', '5e528499-8669-4068-8491-e9cd15730e43'),
    ('0ee2b2c0-9219-4f15-9c1b-6eb58ddbb390', '5e528499-8669-4068-8491-e9cd15730e43'),
    ('cc586537-4907-47a3-88aa-74ee9741f5c1', '5e528499-8669-4068-8491-e9cd15730e43'),
    ('7271e0ea-431b-47c1-93a3-85c4ab477609', '5e528499-8669-4068-8491-e9cd15730e43'),
    ('9d80a2b8-b1b3-4354-ac8e-8a39f69d07ee', '5e528499-8669-4068-8491-e9cd15730e43'),
    ('07b6c04b-bf4b-42f7-b421-91d3b0a5fc9a', '5e528499-8669-4068-8491-e9cd15730e43'),
    ('e1934eb2-cf22-4ee8-882d-99da56f4b4a9', '70dcb962-6156-452b-a763-6307c9520944'),
    ('772e67ee-ca2a-4efc-81c6-9d4d514b9ee4', '70dcb962-6156-452b-a763-6307c9520944'),
    ('92f578b9-67a7-4f39-b184-a46fe47df84f', '70dcb962-6156-452b-a763-6307c9520944'),
    ('feab0622-99a0-4b99-bdc1-b9af2a0e7c83', '70dcb962-6156-452b-a763-6307c9520944'),
    ('feab0622-99a0-4b99-bdc1-b9af2a0e7c83', '287ac216-e24d-41cd-9dad-af2849ab614e'),
    ('feab0622-99a0-4b99-bdc1-b9af2a0e7c83', '24be1b8c-152b-4240-8834-cdabe7061b68'),
    ('feab0622-99a0-4b99-bdc1-b9af2a0e7c83', 'aa668031-9253-4ee8-a030-d6319aac15d5'),
    ('feab0622-99a0-4b99-bdc1-b9af2a0e7c83', '5e528499-8669-4068-8491-e9cd15730e43'),
    ('1272ea87-edf2-4ea4-87c1-e920ddd878f7', '70dcb962-6156-452b-a763-6307c9520944'),
    ('fe2cb557-4f61-479a-9e4e-ed5f0076b466', '70dcb962-6156-452b-a763-6307c9520944');



/* -------------------------------------------------------------------------- */
/*                           Creates Messages table                           */
/* -------------------------------------------------------------------------- */
CREATE TABLE [dbo].[Messages](
    [id] [uniqueidentifier] NOT NULL,
    [conversationId] [uniqueidentifier] NOT NULL,
    [userId] [uniqueidentifier] NOT NULL,
    [content] [nvarchar](max) NOT NULL,
    [dateTime] [datetime] NULL,
PRIMARY KEY CLUSTERED 
    ([id] ASC)  WITH (
        PAD_INDEX = OFF,
        STATISTICS_NORECOMPUTE = OFF,
        IGNORE_DUP_KEY = OFF,
        ALLOW_ROW_LOCKS = ON,
        ALLOW_PAGE_LOCKS = ON,
        OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[Messages] ADD  DEFAULT (newid()) FOR [id]
GO

ALTER TABLE [dbo].[Messages] ADD  DEFAULT (getdate()) FOR [dateTime]
GO

ALTER TABLE [dbo].[Messages]  WITH CHECK ADD FOREIGN KEY([conversationId])
REFERENCES [dbo].[Conversations] ([id])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[Messages]  WITH CHECK ADD FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO

INSERT INTO messages (id, conversationId, userId, content, dateTime) VALUES
    ('5b674519-505b-4733-848d-042a0fe2f5a3', '24be1b8c-152b-4240-8834-cdabe7061b68', '06fcbfba-080f-4be3-98c9-408add8882a0', 'con 2 - Hello message 3', '2024-11-03 14:07:51.670'),
    ('c609c136-d1f1-4a90-8152-10abe81ec873', 'aa668031-9253-4ee8-a030-d6319aac15d5', '20744f67-48f4-44ca-9c9d-16c05134478c', 'con 1 - Hello message 4', '2024-11-03 14:07:51.667'),
    ('f1328879-0a04-42a3-901f-213b56dfcb92', '24be1b8c-152b-4240-8834-cdabe7061b68', '06fcbfba-080f-4be3-98c9-408add8882a0', 'con 2 - Hello message 4', '2024-11-03 14:07:51.670'),
    ('a0fdd8fb-46ef-4111-8ea1-323ed0b84eb7', 'aa668031-9253-4ee8-a030-d6319aac15d5', '05e7e760-8e4c-4042-a67c-051acc798cf6', 'Contrary to popular belief, Lorem Ipsum is not simply random text...', '2024-11-03 14:07:51.667'),
    ('3c2c5045-07e3-49c6-8b9b-3787814eaf9c', 'aa668031-9253-4ee8-a030-d6319aac15d5', '05e7e760-8e4c-4042-a67c-051acc798cf6', 'con 1 - Hello message 2', '2024-11-03 14:07:51.667'),
    ('3e5e8d23-f40e-4a90-afef-6d2224da3067', '24be1b8c-152b-4240-8834-cdabe7061b68', '2ebcc5e2-86c2-4f0d-a8a1-1a69937b1297', 'con 2 - Hello message 1', '2024-11-03 14:07:51.670'),
    ('ec905672-3bc9-41ce-914a-95b0b9e078c8', '24be1b8c-152b-4240-8834-cdabe7061b68', '06fcbfba-080f-4be3-98c9-408add8882a0', 'con 2 - Hello message 5', '2024-11-03 14:07:51.670'),
    ('4f90309e-6415-4a5e-96fa-bd3a229092b8', '24be1b8c-152b-4240-8834-cdabe7061b68', '2ebcc5e2-86c2-4f0d-a8a1-1a69937b1297', 'con 2 - Hello message 2', '2024-11-03 14:07:51.670'),
    ('55c23c64-6a53-48ca-83e1-ce3ab39e0b48', 'aa668031-9253-4ee8-a030-d6319aac15d5', '20744f67-48f4-44ca-9c9d-16c05134478c', 'con 1 - Hello message 3', '2024-11-03 14:07:51.667')

/* -------------------------------------------------------------------------- */
/*                         Creates RefreshTokens table                        */
/* -------------------------------------------------------------------------- */
CREATE TABLE [dbo].[RefreshTokens](
    [id] [uniqueidentifier] NOT NULL,
    [userId] [uniqueidentifier] NOT NULL,
    [token] [nvarchar](256) NOT NULL,
    [expiration] [datetime] NOT NULL,
    [createdAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
    [id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[RefreshTokens] ADD  DEFAULT (newid()) FOR [id]
GO

ALTER TABLE [dbo].[RefreshTokens] ADD  DEFAULT (getdate()) FOR [createdAt]
GO

ALTER TABLE [dbo].[RefreshTokens]  WITH CHECK ADD FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE

