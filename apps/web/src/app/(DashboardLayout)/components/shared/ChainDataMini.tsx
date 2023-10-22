
import { getChainData } from '@/data/chainsUtil'
import { Box } from '@mui/material'
import { useMemo } from 'react'


interface Props {
  chainId?: string // namespace + ":" + reference
}

// const StyledLogo = styled(Image, {})

export default function ChainDataMini({ chainId }: Props) {
  const chainData = useMemo(() => getChainData(chainId), [chainId])
  console.log(chainData)

  if (!chainData) return <></>
  return (
    <>
      <Box>
        chaiData
        <span style={{ marginLeft: '5px' }}>{chainData.name}</span>
      </Box>
    </>
  )
}
