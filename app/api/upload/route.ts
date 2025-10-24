import { NextRequest, NextResponse } from 'next/server'

/**
 * Upload image/file to IPFS via Pinata
 * POST /api/upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Check file type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed' },
        { status: 400 }
      )
    }

    const apiKey = process.env.PINATA_API_KEY
    const apiSecret = process.env.PINATA_API_SECRET

    if (!apiKey || !apiSecret || apiKey.includes('your-')) {
      return NextResponse.json(
        { error: 'Pinata credentials not configured' },
        { status: 500 }
      )
    }

    // Upload to Pinata
    const pinataFormData = new FormData()
    pinataFormData.append('file', file)

    const metadata = JSON.stringify({
      name: `agent-image-${Date.now()}-${file.name}`,
      keyvalues: {
        type: 'agent-avatar',
        uploadedAt: new Date().toISOString(),
      },
    })
    pinataFormData.append('pinataMetadata', metadata)

    const options = JSON.stringify({
      cidVersion: 1,
    })
    pinataFormData.append('pinataOptions', options)

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
      body: pinataFormData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Pinata upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload to IPFS' },
        { status: 500 }
      )
    }

    const result = await response.json()
    const ipfsHash = result.IpfsHash
    const ipfsUri = `ipfs://${ipfsHash}`
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`

    return NextResponse.json({
      success: true,
      ipfsHash,
      ipfsUri,
      gatewayUrl,
      size: file.size,
      type: file.type,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
