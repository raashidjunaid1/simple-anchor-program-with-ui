import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { HelloWorldWithReact } from "../target/types/hello_world_with_react";

describe("hello-world-with-react", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.HelloWorldWithReact as Program<HelloWorldWithReact>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
