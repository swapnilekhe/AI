class CometAgentHandler {
    private formContext: Xrm.FormContext;

    private advanceSearchFilterCondition: string = "";
    private agentRoleId: number | null = null;
    private isPrimary: boolean | null = null;

    // Preserves the currently selected policy information.
    private policyResult: PolicyResult | null = null;

    constructor(executionContext: Xrm.Events.EventContext) {
        this.formContext = executionContext.getFormContext();
    }

    public async initialize(): Promise<void> {
        const policyField =
            this.formContext.getAttribute<Xrm.Attributes.LookupAttribute>(
                POLICY_FIELDS.er_policyid
            );

        const agentRoleField =
            this.formContext.getAttribute<Xrm.Attributes.OptionSetAttribute>(
                POLICY_FIELDS.er_agentrole
            );

        const isPrimaryField =
            this.formContext.getAttribute<Xrm.Attributes.BooleanAttribute>(
                POLICY_FIELDS.er_isprimary
            );

        /*
         * When the policy changes:
         * 1. Clear the cached policy result.
         * 2. Retrieve the newly selected policy.
         * 3. Apply the Comet Agent lookup filter.
         */
        policyField?.addOnChange(async () => {
            this.policyResult = null;
            await this.filterCometAgentLookup(false);
        });

        /*
         * Agent role and primary changes do not require retrieving
         * the policy again because policyResult is already cached.
         */
        agentRoleField?.addOnChange(async () => {
            await this.filterCometAgentLookup(false);
        });

        isPrimaryField?.addOnChange(async () => {
            await this.filterCometAgentLookup(false);
        });

        // Initial form-load execution.
        await this.loadSelectedPolicy();
        await this.filterCometAgentLookup(true);
    }

    /**
     * Retrieves the selected policy and stores it in this.policyResult.
     */
    private async loadSelectedPolicy(): Promise<PolicyResult | null> {
        const policy =
            this.formContext
                .getAttribute<Xrm.Attributes.LookupAttribute>(
                    POLICY_FIELDS.er_policyid
                )
                ?.getValue();

        if (!policy?.length) {
            this.policyResult = null;
            return null;
        }

        const policyId = policy[0].id.replace(/[{}]/g, "");

        const selectQuery =
            `?$select=` +
            `${POLICY_FIELDS.policyId},` +
            `${POLICY_FIELDS.accountExecutiveId},` +
            `${POLICY_FIELDS.agencyId},` +
            `${POLICY_FIELDS.accountNum},` +
            `${POLICY_FIELDS.caseCovId}`;

        try {
            const result = await Xrm.WebApi.retrieveRecord(
                ENTITIES.hsl_policy,
                policyId,
                selectQuery
            );

            this.policyResult = {
                hsl_policyid:
                    result[POLICY_FIELDS.policyId],

                accountexecutiveid:
                    result[POLICY_FIELDS.accountExecutiveId] ?? null,

                agencyid:
                    result[POLICY_FIELDS.agencyId] ?? null,

                er_acct_num:
                    result[POLICY_FIELDS.accountNum] ?? null,

                er_case_cov_id:
                    result[POLICY_FIELDS.caseCovId] ?? null
            };

            return this.policyResult;
        } catch (error) {
            console.error("Unable to retrieve policy details.", error);
            this.policyResult = null;
            return null;
        }
    }

    public async filterCometAgentLookup(
        isFormLoad: boolean = false
    ): Promise<void> {
        const agentControl =
            this.formContext.getControl<Xrm.Controls.LookupControl>(
                COMMISSION_FIELDS.er_agentid
            );

        try {
            agentControl?.setDisabled(true);

            const policy =
                this.formContext
                    .getAttribute<Xrm.Attributes.LookupAttribute>(
                        POLICY_FIELDS.er_policyid
                    )
                    ?.getValue();

            this.agentRoleId =
                this.formContext
                    .getAttribute<Xrm.Attributes.OptionSetAttribute>(
                        POLICY_FIELDS.er_agentrole
                    )
                    ?.getValue() ?? null;

            this.isPrimary =
                this.formContext
                    .getAttribute<Xrm.Attributes.BooleanAttribute>(
                        POLICY_FIELDS.er_isprimary
                    )
                    ?.getValue() ?? null;

            /*
             * Do not use "!this.isPrimary" here.
             * false is a valid value for a Two Options field.
             */
            if (
                !policy?.length ||
                this.agentRoleId === null ||
                this.isPrimary === null
            ) {
                this.setCometAgentLookup();
                return;
            }

            /*
             * Retrieve the policy only when:
             * - it has not been loaded yet, or
             * - the policy field changed and cleared the cached value.
             */
            if (!this.policyResult) {
                await this.loadSelectedPolicy();
            }

            if (!this.policyResult) {
                this.setCometAgentLookup();
                return;
            }

            if (!isFormLoad) {
                this.formContext
                    .getAttribute<Xrm.Attributes.LookupAttribute>(
                        COMMISSION_FIELDS.er_agentid
                    )
                    ?.setValue(null);
            }

            await this.applyPolicyFilter();
        } catch (error) {
            console.error("Unable to filter the Comet Agent lookup.", error);
            this.setCometAgentLookup();
        } finally {
            agentControl?.setDisabled(false);
        }
    }

    /**
     * Uses the cached this.policyResult value.
     */
    private async applyPolicyFilter(): Promise<void> {
        if (!this.policyResult) {
            this.setCometAgentLookup();
            return;
        }

        const policyResult = this.policyResult;

        let agencyOrAccountExecutiveId: string | null = null;

        if (this.agentRoleId === AGENTROLES.broker) {
            agencyOrAccountExecutiveId = policyResult.agencyid;
        } else if (
            this.agentRoleId === AGENTROLES.accountExecutive
        ) {
            agencyOrAccountExecutiveId =
                policyResult.accountexecutiveid;
        }

        if (
            this.agentRoleId === AGENTROLES.broker &&
            !policyResult.agencyid &&
            this.isPrimary === true
        ) {
            displayAlert(
                MESSAGES.PolicyFieldValidationTitle,
                MESSAGES.EmpltyAgencyOnPolicy,
                MESSAGES.Ok
            );

            agencyOrAccountExecutiveId =
                CONFIG.DEFAULT_RECORD_ID;
        } else if (
            this.agentRoleId === AGENTROLES.accountExecutive &&
            !policyResult.accountexecutiveid &&
            this.isPrimary === true
        ) {
            displayAlert(
                MESSAGES.PolicyFieldValidationTitle,
                MESSAGES.EmpltyAccountExecutiveOnPolicy,
                MESSAGES.Ok
            );

            agencyOrAccountExecutiveId =
                CONFIG.DEFAULT_RECORD_ID;
        }

        if (
            this.agentRoleId === AGENTROLES.broker &&
            policyResult.agencyid
        ) {
            await this.setCometAgentLookupForAgency(
                policyResult.agencyid
            );
        } else {
            this.setCometAgentLookup(
                agencyOrAccountExecutiveId
            );
        }
    }

    // Existing methods continue here:
    // setCometAgentLookupForAgency()
    // preAgentSearchHandler
    // setCometAgentLookup()
    // getFilterCondition()
}