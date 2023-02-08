-- AddSecurityPolicy
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant ON "Tenant" USING ("id" = current_setting('app.tenantId', TRUE)::text);
CREATE POLICY tenant_bypass ON "Tenant" USING (current_setting('app.bypass', TRUE)::text = 'on');

-- AddSecurityPolicy
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

CREATE POLICY user_tenant ON "User" USING ("tenantId" = current_setting('app.tenantId', TRUE)::text);
CREATE POLICY user_bypass ON "User" USING (current_setting('app.bypass', TRUE)::text = 'on');

-- AddSecurityPolicy
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" FORCE ROW LEVEL SECURITY;

CREATE POLICY post_tenant ON "Post" FOR select USING ("tenantId" = current_setting('app.tenantId', TRUE)::text);
CREATE POLICY post_user_delete ON "Post" USING ("userId" = current_setting('app.userId', TRUE)::text);
