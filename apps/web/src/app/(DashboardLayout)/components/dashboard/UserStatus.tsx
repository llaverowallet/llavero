import { useSession, signIn, signOut } from "next-auth/react"

export default function UserStatus() {
  const { data: session } = useSession()
  if (session && session.user) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in l2 <br />
      <button onClick={() => signIn("cognito")}>Sign in</button>
    </>
  )
}