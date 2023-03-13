use anchor_lang::prelude::*;

declare_id!("7wZ5gGfuFLcambH1bTpXiPycANgVv1rM2QVUAdrEhRaq");

#[derive(Copy, Clone, PartialEq, AnchorSerialize, AnchorDeserialize, Default, Debug)]
pub struct LimitOrder {
    pub fieldA: u64,
    pub fieldB: bool,
}

#[program]
mod hello_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, price: u64) -> Result<()> {
        let my_account = &mut ctx.accounts.my_account;
        my_account.price = price;
        my_account.executed = false;
        Ok(())
    }

    pub fn update(ctx: Context<Update>, executed: bool) -> Result<()> {
        let my_account = &mut ctx.accounts.my_account;
        my_account.executed = executed;
        Ok(())
    }

    pub fn get_data(ctx: Context<GetData>, _params: GetDataParams) -> Result<LimitOrder> {
        let position = &ctx.accounts.my_account;

        Ok(LimitOrder {
            fieldA: position.price,
            fieldB: position.executed,
        })
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 1 + 8)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetDataParams {}

#[derive(Accounts)]
pub struct GetData<'info> {
    #[account()]
    pub my_account: Account<'info, MyAccount>,
}

#[account]
pub struct MyAccount {
    pub executed: bool,
    pub price: u64,
}
