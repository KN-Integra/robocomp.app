import { GALLERY_IMG_SIZE_PX } from '~/settings/constants'

import type { H3Error } from 'h3'
import type { MetaAlbum, MetaAlbumsData, MetaArray } from '~/types/meta'

const runtimeConfig = useRuntimeConfig()

export interface AlbumResponse {
  data: MetaArray<MetaAlbum>['data']
  statusCode: number
}

// TODO: Cache results for some time
async function authorize() {
  if (!runtimeConfig.META_API_KEY) {
    throw new Error('META_API_KEY is not defined')
  }
  if (!runtimeConfig.ROBOCOMP_PAGE_ID) {
    throw new Error('ROBOCOMP_PAGE_ID is not defined')
  }
  if (!runtimeConfig.META_GRAPH_ENDPOINT) {
    throw new Error('META_GRAPH_ENDPOINT is not defined')
  }
  if (!runtimeConfig.META_GRAPH_VERSION) {
    throw new Error('META_GRAPH_VERSION is not defined')
  }

  try {
    const query = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: runtimeConfig.META_APP_ID as string,
      client_secret: runtimeConfig.META_APP_SECRET as string,
      fb_exchange_token: runtimeConfig.META_API_KEY as string
    })

    const response = await $fetch(
      `${runtimeConfig.META_GRAPH_ENDPOINT}/${runtimeConfig.META_GRAPH_VERSION}/oauth/access_token?${query.toString()}`
    )

    console.debug('Authorized with Meta API:', response)

    return response.access_token
  } catch (error) {
    console.error('Error authorizing with Meta API:', error)
    throw error
  }
}

export default defineEventHandler(async (): Promise<AlbumResponse | H3Error> => {
  try {
    const accessToken = await authorize()

    const query = new URLSearchParams({
      fields: 'photos{link,webp_images},name,link',
      access_token: accessToken
    })

    const response = await $fetch<MetaAlbumsData>(
      `${runtimeConfig.META_GRAPH_ENDPOINT}/${runtimeConfig.META_GRAPH_VERSION}/${runtimeConfig.ROBOCOMP_PAGE_ID}/albums?${query.toString()}`
    )

    const filtered = response.data.filter((v) => /robocomp/i.test(v.name))
    const mapped = filtered.map((v) => ({
      ...v,
      name: v.name.match(/robocomp (\d{4})/i)![1]
    }))

    const processed = mapped.reduce(
      (acc, v) => {
        const i = acc.findIndex((p) => p.name === v.name)

        if (i === -1) {
          acc.push(v)
        }
        /* else {
        acc[i].photos.data.push(...v.photos.data)
      } */

        return acc
      },
      [] as MetaArray<MetaAlbum>['data']
    )

    const withFilteredImages = processed.map((v) => ({
      ...v,
      photos: {
        ...v.photos,
        data: v.photos.data.map((img) => ({
          ...img,
          webp_images: img.webp_images
            .filter((i) => (i.width > i.height ? i.width : i.height) > GALLERY_IMG_SIZE_PX)
            .sort((a, b) => b.width - a.width)
        }))
      }
    }))

    return {
      statusCode: 200,
      data: withFilteredImages
    }
  } catch (error) {
    console.error(error)

    return createError({
      statusCode: 500,
      message: (error as Error).message
    })
  }
})
